-- Duck Tycoon — Supabase schema, RLS and game logic.
-- Run once in Supabase SQL editor (Dashboard → SQL → New query → paste → Run).
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    userid           UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    username         VARCHAR(40)   NOT NULL,
    days_school_left INT,
    days_work_left   INT,
    salary           NUMERIC(10,2) NOT NULL DEFAULT 15.00,
    net_worth_la     NUMERIC(20,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS public.bank_acc (
    userid       UUID PRIMARY KEY REFERENCES public.users (userid) ON DELETE CASCADE,
    checking_amt NUMERIC(10,2) NOT NULL,
    savings_amt  NUMERIC(10,2) NOT NULL,
    amt_chk_la   NUMERIC(10,2) NOT NULL,
    amt_sav_la   NUMERIC(10,2) NOT NULL,
    games_played INT           NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.stocks (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(40)   NOT NULL,
    tot_num_shares BIGINT        NOT NULL,
    market_price   NUMERIC(20,2) NOT NULL,
    shares_avail   BIGINT        NOT NULL
);

CREATE TABLE IF NOT EXISTS public.owned_shares (
    userid           UUID   NOT NULL REFERENCES public.users (userid) ON DELETE CASCADE,
    stock_id         INT    NOT NULL REFERENCES public.stocks (id),
    num_shares_owned BIGINT NOT NULL,
    input_investment NUMERIC(20,2) NOT NULL,
    market_price_la  NUMERIC(20,2) NOT NULL,
    PRIMARY KEY (userid, stock_id)
);

INSERT INTO public.stocks (name, tot_num_shares, market_price, shares_avail)
SELECT * FROM (VALUES
    ('JOHN', 300::bigint,  3.00::numeric,   300::bigint),
    ('ALEX', 80,           1.20,            80),
    ('RDZG', 90,           3.00,            90),
    ('SEAN', 100,          0.80,            100),
    ('ALEN', 5,            500.00,          5),
    ('FAZE', 5000,         0.01,            5000)
) AS seed(name, tot_num_shares, market_price, shares_avail)
WHERE NOT EXISTS (SELECT 1 FROM public.stocks);

-- ---------------------------------------------------------------------------
-- Row Level Security. Clients only ever SELECT; all writes go through the
-- SECURITY DEFINER functions below, which key off auth.uid().
-- ---------------------------------------------------------------------------
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_acc     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owned_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users: read all"          ON public.users;
DROP POLICY IF EXISTS "bank_acc: read own"       ON public.bank_acc;
DROP POLICY IF EXISTS "stocks: read all"         ON public.stocks;
DROP POLICY IF EXISTS "owned_shares: read own"   ON public.owned_shares;

-- Everyone logged in can read every user row (needed for leaderboard).
CREATE POLICY "users: read all"        ON public.users        FOR SELECT TO authenticated USING (true);
CREATE POLICY "bank_acc: read own"     ON public.bank_acc     FOR SELECT TO authenticated USING (userid = auth.uid());
CREATE POLICY "stocks: read all"       ON public.stocks       FOR SELECT TO authenticated USING (true);
CREATE POLICY "owned_shares: read own" ON public.owned_shares FOR SELECT TO authenticated USING (userid = auth.uid());

-- ---------------------------------------------------------------------------
-- Path setup shared by the signup trigger and the choose_path RPC.
-- 0 = school (32 school days, $50/$50), 1 = work (12 work days, $250/$250).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_path(p_uid UUID, p_choice INT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM bank_acc WHERE userid = p_uid) THEN
        RAISE EXCEPTION 'Path already chosen';
    END IF;

    IF p_choice = 0 THEN
        UPDATE users SET days_school_left = 32 WHERE userid = p_uid;
        INSERT INTO bank_acc (userid, checking_amt, savings_amt, amt_chk_la, amt_sav_la, games_played)
        VALUES (p_uid, 50.00, 50.00, 50.00, 50.00, 0);
    ELSIF p_choice = 1 THEN
        UPDATE users SET days_work_left = 12 WHERE userid = p_uid;
        INSERT INTO bank_acc (userid, checking_amt, savings_amt, amt_chk_la, amt_sav_la, games_played)
        VALUES (p_uid, 250.00, 250.00, 250.00, 250.00, 0);
    ELSE
        RAISE EXCEPTION 'Path must be 0 (school) or 1 (work)';
    END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- New auth user → public.users row (+ bank account if signup metadata
-- carried a path). Username and path come from signUp options.data.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_path TEXT := NEW.raw_user_meta_data ->> 'path';
BEGIN
    INSERT INTO public.users (userid, username, salary, net_worth_la)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'username', ''), split_part(NEW.email, '@', 1)),
        15.00,
        0.00
    )
    ON CONFLICT (userid) DO NOTHING;

    IF v_path IN ('0', '1') THEN
        PERFORM public.apply_path(NEW.id, v_path::INT);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helper: current user or fail.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.require_uid()
RETURNS UUID LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_uid UUID := auth.uid();
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    RETURN v_uid;
END;
$$;

-- ---------------------------------------------------------------------------
-- Game actions (called via supabase.rpc). Same math as the original
-- stored procedures; userid now comes from the JWT instead of a parameter.
-- ---------------------------------------------------------------------------

-- 0 = school, 1 = work. Fallback for accounts created without path metadata.
CREATE OR REPLACE FUNCTION public.choose_path(p_choice INT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    PERFORM public.apply_path(public.require_uid(), p_choice);
END;
$$;

CREATE OR REPLACE FUNCTION public.transfer_checking_to_savings(p_amount NUMERIC)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_uid UUID := public.require_uid();
    v_checking_amt NUMERIC(10,2);
BEGIN
    IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;

    SELECT checking_amt INTO v_checking_amt FROM bank_acc WHERE userid = v_uid FOR UPDATE;

    IF v_checking_amt >= p_amount THEN
        UPDATE bank_acc
        SET checking_amt = checking_amt - p_amount,
            savings_amt  = savings_amt + p_amount
        WHERE userid = v_uid;
    ELSE
        RAISE EXCEPTION 'Insufficient funds in checking account';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.transfer_savings_to_checking(p_amount NUMERIC)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_uid UUID := public.require_uid();
    v_savings_amt NUMERIC(10,2);
BEGIN
    IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;

    SELECT savings_amt INTO v_savings_amt FROM bank_acc WHERE userid = v_uid FOR UPDATE;

    IF v_savings_amt >= p_amount THEN
        UPDATE bank_acc
        SET savings_amt  = savings_amt - p_amount,
            checking_amt = checking_amt + p_amount
        WHERE userid = v_uid;
    ELSE
        RAISE EXCEPTION 'Insufficient funds in savings account';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.buy_stocks(p_stock_id INT, p_num_shares BIGINT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_uid           UUID := public.require_uid();
    v_current_price NUMERIC(20,2);
    v_shares_avail  BIGINT;
    v_total_cost    NUMERIC(20,2);
    v_checking_amt  NUMERIC(10,2);
BEGIN
    IF p_num_shares <= 0 THEN RAISE EXCEPTION 'Share count must be positive'; END IF;

    SELECT market_price, shares_avail INTO v_current_price, v_shares_avail
    FROM stocks WHERE id = p_stock_id FOR UPDATE;

    IF v_current_price IS NULL THEN RAISE EXCEPTION 'Unknown stock'; END IF;
    IF v_shares_avail < p_num_shares THEN RAISE EXCEPTION 'Not enough shares available'; END IF;

    v_total_cost := v_current_price * p_num_shares;

    SELECT checking_amt INTO v_checking_amt FROM bank_acc WHERE userid = v_uid FOR UPDATE;

    IF v_checking_amt IS NULL OR v_checking_amt < v_total_cost THEN
        RAISE EXCEPTION 'Insufficient funds in checking account';
    END IF;

    UPDATE bank_acc SET checking_amt = checking_amt - v_total_cost WHERE userid = v_uid;

    INSERT INTO owned_shares (userid, stock_id, num_shares_owned, input_investment, market_price_la)
    VALUES (v_uid, p_stock_id, p_num_shares, v_total_cost, v_current_price)
    ON CONFLICT (userid, stock_id) DO UPDATE SET
        num_shares_owned = owned_shares.num_shares_owned + p_num_shares,
        input_investment = owned_shares.input_investment + v_total_cost;

    UPDATE stocks
    SET shares_avail = shares_avail - p_num_shares,
        market_price = market_price * power(1.02, p_num_shares)
    WHERE id = p_stock_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sell_stocks(p_stock_id INT, p_num_shares BIGINT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_uid                  UUID := public.require_uid();
    v_current_price        NUMERIC(20,2);
    v_shares_owned         BIGINT;
    v_input_investment     NUMERIC(20,2);
    v_total_return         NUMERIC(20,2);
    v_new_input_investment NUMERIC(20,2);
BEGIN
    IF p_num_shares <= 0 THEN RAISE EXCEPTION 'Share count must be positive'; END IF;

    SELECT market_price INTO v_current_price FROM stocks WHERE id = p_stock_id FOR UPDATE;

    SELECT num_shares_owned, input_investment INTO v_shares_owned, v_input_investment
    FROM owned_shares WHERE userid = v_uid AND stock_id = p_stock_id FOR UPDATE;

    IF v_shares_owned IS NULL OR v_shares_owned < p_num_shares THEN
        RAISE EXCEPTION 'Insufficient shares to sell';
    END IF;

    v_total_return := v_current_price * p_num_shares;

    UPDATE bank_acc SET checking_amt = checking_amt + v_total_return WHERE userid = v_uid;

    UPDATE stocks
    SET shares_avail = shares_avail + p_num_shares,
        market_price = market_price * power(0.98, p_num_shares)
    WHERE id = p_stock_id;

    v_new_input_investment := (v_input_investment / v_shares_owned) * (v_shares_owned - p_num_shares);

    UPDATE owned_shares
    SET num_shares_owned = v_shares_owned - p_num_shares,
        input_investment = v_new_input_investment
    WHERE userid = v_uid AND stock_id = p_stock_id;

    DELETE FROM owned_shares
    WHERE userid = v_uid AND stock_id = p_stock_id AND num_shares_owned = 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.work()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_uid            UUID := public.require_uid();
    school_days_left INT;
    work_days_left   INT;
    user_salary      NUMERIC(10,2);
BEGIN
    SELECT days_school_left, days_work_left, salary
    INTO school_days_left, work_days_left, user_salary
    FROM users WHERE userid = v_uid FOR UPDATE;

    IF school_days_left > 0 THEN
        -- Part-time while in school.
        UPDATE bank_acc SET checking_amt = checking_amt + user_salary WHERE userid = v_uid;
    ELSIF work_days_left > 1 THEN
        UPDATE bank_acc SET checking_amt = checking_amt + 5 WHERE userid = v_uid;
        UPDATE users SET days_work_left = days_work_left - 1 WHERE userid = v_uid;
    ELSE
        -- Pay day + raise, reset cycle.
        UPDATE bank_acc SET checking_amt = checking_amt + user_salary WHERE userid = v_uid;
        UPDATE users SET salary = salary + 5, days_work_left = 12 WHERE userid = v_uid;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.study()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_uid            UUID := public.require_uid();
    school_days_left INT;
BEGIN
    SELECT days_school_left INTO school_days_left FROM users WHERE userid = v_uid FOR UPDATE;

    IF school_days_left > 0 THEN
        UPDATE users SET days_school_left = days_school_left - 1 WHERE userid = v_uid;
    ELSE
        UPDATE users SET salary = salary + 25 WHERE userid = v_uid;
    END IF;
END;
$$;

-- Internal helper, not exposed to clients.
CREATE OR REPLACE FUNCTION public.net_worth(p_userid UUID)
RETURNS NUMERIC LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_net_worth NUMERIC(20,2);
BEGIN
    SELECT COALESCE(checking_amt + savings_amt, 0) INTO v_net_worth
    FROM bank_acc WHERE userid = p_userid;

    v_net_worth := COALESCE(v_net_worth, 0) + (
        SELECT COALESCE(SUM(os.num_shares_owned * s.market_price), 0)
        FROM owned_shares os JOIN stocks s ON os.stock_id = s.id
        WHERE os.userid = p_userid
    );

    RETURN v_net_worth;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_stats(
    OUT p_new_net_worth NUMERIC,
    OUT p_new_checking  NUMERIC,
    OUT p_new_savings   NUMERIC,
    OUT p_old_net_worth NUMERIC,
    OUT p_old_checking  NUMERIC,
    OUT p_old_savings   NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_uid UUID := public.require_uid();
BEGIN
    SELECT u.net_worth_la, b.amt_chk_la, b.amt_sav_la
    INTO p_old_net_worth, p_old_checking, p_old_savings
    FROM users u JOIN bank_acc b ON b.userid = u.userid
    WHERE u.userid = v_uid;

    p_new_net_worth := public.net_worth(v_uid);

    SELECT checking_amt, savings_amt INTO p_new_checking, p_new_savings
    FROM bank_acc WHERE userid = v_uid;

    UPDATE users    SET net_worth_la = p_new_net_worth WHERE userid = v_uid;
    UPDATE bank_acc SET amt_chk_la = p_new_checking, amt_sav_la = p_new_savings WHERE userid = v_uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_stock_stats(
    p_stock_id  INT,
    OUT p_old_value NUMERIC,
    OUT p_new_value NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_uid UUID := public.require_uid();
BEGIN
    SELECT market_price_la INTO p_old_value
    FROM owned_shares WHERE userid = v_uid AND stock_id = p_stock_id;

    SELECT market_price INTO p_new_value FROM stocks WHERE id = p_stock_id;

    UPDATE owned_shares SET market_price_la = p_new_value
    WHERE userid = v_uid AND stock_id = p_stock_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.played_game()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_uid          UUID := public.require_uid();
    v_games_played INT;
BEGIN
    UPDATE bank_acc SET games_played = games_played + 1
    WHERE userid = v_uid
    RETURNING games_played INTO v_games_played;

    -- Every 10th game: 10% interest on savings.
    IF v_games_played % 10 = 0 THEN
        UPDATE bank_acc SET savings_amt = savings_amt * 1.10 WHERE userid = v_uid;
    END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Grants: only logged-in users may call game actions; helpers stay private.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
    public.choose_path(INT),
    public.transfer_checking_to_savings(NUMERIC),
    public.transfer_savings_to_checking(NUMERIC),
    public.buy_stocks(INT, BIGINT),
    public.sell_stocks(INT, BIGINT),
    public.work(),
    public.study(),
    public.update_stats(),
    public.update_stock_stats(INT),
    public.played_game()
TO authenticated;

REVOKE EXECUTE ON FUNCTION
    public.net_worth(UUID),
    public.require_uid(),
    public.apply_path(UUID, INT),
    public.handle_new_user()
FROM authenticated;
