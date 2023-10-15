CREATE OR REPLACE FUNCTION addUser(
    p_username VARCHAR(100),
    p_userid VARCHAR(40)
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO users (
        username,
        userid,
        salary,
        net_worth_LA
    )
    VALUES (
        p_username,
        p_userid,
        15.00,
        0.00
    );
END;
$$;

-- choose_path Procedure
CREATE OR REPLACE FUNCTION choose_path(
    p_userid VARCHAR(100),
    p_choice INT
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    IF p_choice = 0 THEN
        UPDATE users
        SET days_school_left = 32
        WHERE userid = p_userid;
        
        INSERT INTO bank_acc (userid, checking_amt, savings_amt, amt_chk_LA, amt_sav_LA, games_played)
        VALUES (p_userid, 50.00, 50.00, 50.00, 50.00, 0);
    ELSIF p_choice = 1 THEN
        UPDATE users
        SET days_work_left = 12
        WHERE userid = p_userid;
        
        INSERT INTO bank_acc (userid, checking_amt, savings_amt, amt_chk_LA, amt_sav_LA, games_played)
        VALUES (p_userid, 250.00, 250.00, 250.00, 250.00, 0);
    END IF;
END;
$$;

-- transferCheckingToSavings Procedure
CREATE OR REPLACE FUNCTION transferCheckingToSavings(
    p_userid VARCHAR(100),
    p_amount DECIMAL(10,2)
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_checking_amt DECIMAL(10,2);
BEGIN
    SELECT checking_amt INTO v_checking_amt
    FROM bank_acc WHERE userid = p_userid;
    
    IF v_checking_amt >= p_amount THEN
        UPDATE bank_acc
        SET checking_amt = checking_amt - p_amount,
            savings_amt = savings_amt + p_amount
        WHERE userid = p_userid;
    ELSE
        RAISE EXCEPTION 'Insufficient funds in checking account';
    END IF;
END;
$$;

-- transferSavingsToChecking Procedure
CREATE OR REPLACE FUNCTION transferSavingsToChecking(
    p_userid VARCHAR(100),
    p_amount DECIMAL(10,2)
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_savings_amt DECIMAL(10,2);
BEGIN
    SELECT savings_amt INTO v_savings_amt
    FROM bank_acc WHERE userid = p_userid;
    
    IF v_savings_amt >= p_amount THEN
        UPDATE bank_acc
        SET savings_amt = savings_amt - p_amount,
            checking_amt = checking_amt + p_amount
        WHERE userid = p_userid;
    ELSE
        RAISE EXCEPTION 'Insufficient funds in savings account';
    END IF;
END;
$$;

-- buy_stocks Procedure
CREATE OR REPLACE FUNCTION buy_stocks(
    p_userid VARCHAR(100),
    p_stock_id INT,
    p_num_shares BIGINT
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_current_price DECIMAL(20,2);
    v_total_cost DECIMAL(20,2);
    v_checking_amt DECIMAL(10,2);
BEGIN
    SELECT market_price INTO v_current_price
    FROM stocks
    WHERE id = p_stock_id;

    v_total_cost := v_current_price * p_num_shares;

    SELECT checking_amt INTO v_checking_amt
    FROM bank_acc
    WHERE userid = p_userid;

    IF v_checking_amt < v_total_cost THEN
        RAISE EXCEPTION 'Insufficient funds in checking account';
    ELSE
        UPDATE bank_acc
        SET checking_amt = checking_amt - v_total_cost
        WHERE userid = p_userid;
        
        -- PostgreSQL doesn't have a direct equivalent for ON DUPLICATE KEY UPDATE, 
        -- so we use an INSERT ... ON CONFLICT DO UPDATE instead:
        INSERT INTO owned_shares (userid, id, num_shares_owned, input_investment, market_price_LA)
        VALUES (p_userid, p_stock_id, p_num_shares, v_total_cost, v_current_price)
        ON CONFLICT (userid, id) 
        DO UPDATE SET 
            num_shares_owned = owned_shares.num_shares_owned + p_num_shares,
            input_investment = owned_shares.input_investment + v_total_cost;
        
        UPDATE stocks
        SET tot_num_shares = tot_num_shares,
            shares_avail = shares_avail - p_num_shares,
			market_price = market_price * power(1.02, p_num_shares)
        WHERE id = p_stock_id;
    END IF;
END;
$$;

-- sell_stocks Procedure
CREATE OR REPLACE FUNCTION sell_stocks(
    p_userid VARCHAR(100),
    p_stock_id INT,
    p_num_shares BIGINT
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_current_price DECIMAL(20,2);
    v_shares_owned BIGINT;
    v_input_investment DECIMAL(20,2);
    v_total_return DECIMAL(20,2);
    v_new_input_investment DECIMAL(20,2);
BEGIN
    SELECT market_price INTO v_current_price
    FROM stocks
    WHERE id = p_stock_id;
    
    SELECT num_shares_owned, input_investment INTO v_shares_owned, v_input_investment
    FROM owned_shares
    WHERE userid = p_userid AND id = p_stock_id;
    
    IF v_shares_owned IS NULL OR v_shares_owned < p_num_shares THEN
        RAISE EXCEPTION 'Insufficient shares to sell';
    ELSE
        v_total_return := v_current_price * p_num_shares;

        UPDATE bank_acc
        SET checking_amt = checking_amt + v_total_return
        WHERE userid = p_userid;
        
        UPDATE stocks
        SET shares_avail = shares_avail + p_num_shares,
		market_price = market_price * power(0.98, p_num_shares)
        WHERE id = p_stock_id;
        
        v_new_input_investment := (v_input_investment / v_shares_owned) * (v_shares_owned - p_num_shares);
        
        UPDATE owned_shares
        SET num_shares_owned = v_shares_owned - p_num_shares,
            input_investment = v_new_input_investment
        WHERE userid = p_userid AND id = p_stock_id;
        
        DELETE FROM owned_shares
        WHERE userid = p_userid AND id = p_stock_id AND num_shares_owned = 0;
    END IF;
END;
$$;

-- work Procedure
CREATE OR REPLACE FUNCTION work(
    p_userid VARCHAR(40)
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    school_days_left INT;
    work_days_left INT;
    user_salary DECIMAL(10,2);
BEGIN
    SELECT days_school_left, days_work_left, salary INTO school_days_left, work_days_left, user_salary
    FROM users
    WHERE userid = p_userid;

    IF school_days_left > 0 THEN
        UPDATE bank_acc
        SET checking_amt = checking_amt + user_salary
        WHERE userid = p_userid;
    ELSE
        IF work_days_left > 1 THEN
            UPDATE bank_acc
            SET checking_amt = checking_amt + 5
            WHERE userid = p_userid;

            UPDATE users
            SET days_work_left = days_work_left - 1
            WHERE userid = p_userid;
        ELSE
            UPDATE bank_acc
            SET checking_amt = checking_amt + user_salary
            WHERE userid = p_userid;

            UPDATE users
            SET salary = salary + 5, days_work_left = 12
            WHERE userid = p_userid;
        END IF;
    END IF;
END;
$$;

-- study Procedure
CREATE OR REPLACE FUNCTION study(
    p_userid VARCHAR(40)
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    school_days_left INT;
BEGIN
    SELECT days_school_left INTO school_days_left
    FROM users
    WHERE userid = p_userid;
    
    IF school_days_left > 0 THEN
        UPDATE users
        SET days_school_left = days_school_left - 1
        WHERE userid = p_userid;
	ELSE
        UPDATE users
        SET salary = salary + 25
        WHERE userid = p_userid;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION net_worth(
	p_userid VARCHAR(100)) RETURNS DECIMAL(20,2) LANGUAGE plpgsql AS $$
DECLARE
	net_worth DECIMAL(20,2);
BEGIN
	net_worth := 
	(SELECT (checking_amt + savings_amt)
    FROM bank_acc
    WHERE userid = p_userid);
	
	net_worth := net_worth + (
        SELECT COALESCE(SUM(os.num_shares_owned * s.market_price), 0)
        FROM owned_shares os
        JOIN stocks s ON os.id = s.id
        WHERE os.userid = p_userid
    );
	
	RETURN net_worth;
END;
$$;


-- update_stats Procedure
CREATE OR REPLACE FUNCTION update_stats(
    p_userid VARCHAR(100),
    OUT p_new_net_worth DECIMAL(20,2),
    OUT p_new_checking DECIMAL(10,2),
    OUT p_new_savings DECIMAL(10,2),
	OUT p_old_net_worth DECIMAL(20,2),
    OUT p_old_checking DECIMAL(10,2),
    OUT p_old_savings DECIMAL(10,2)
) LANGUAGE plpgsql AS $$
BEGIN
    SELECT net_worth_LA, amt_chk_LA, amt_sav_LA 
    INTO p_old_net_worth, p_old_checking, p_old_savings
    FROM users NATURAL JOIN bank_acc
    WHERE userid = p_userid;
    
    -- Instead of CALL, in PostgreSQL use PERFORM
    p_new_net_worth := net_worth(p_userid);--
    
    SELECT checking_amt, savings_amt
    INTO p_new_checking, p_new_savings
    FROM bank_acc
    WHERE userid = p_userid;
    
    UPDATE users
    SET net_worth_LA = p_new_net_worth
    WHERE userid = p_userid;
    
    UPDATE bank_acc
    SET amt_chk_LA = p_new_checking,
        amt_sav_LA = p_new_savings
    WHERE userid = p_userid;
    
END;
$$;

-- update_stock_stats Procedure
CREATE OR REPLACE FUNCTION update_stock_stats(
    p_userid VARCHAR(100),
    p_stock_id INT,
    OUT p_old_value DECIMAL(20,2),
    OUT p_new_value DECIMAL(20,2)
) LANGUAGE plpgsql AS $$
DECLARE
    v_old_market_price DECIMAL(20,2);
    v_new_market_price DECIMAL(20,2);
    v_num_shares_owned BIGINT;
	v_total_num_shares_owned BIGINT;
BEGIN
    SELECT market_price_LA, num_shares_owned 
    INTO v_old_market_price, v_num_shares_owned
    FROM owned_shares
    WHERE userid = p_userid AND id = p_stock_id;
    
    SELECT market_price
    INTO v_new_market_price
    FROM stocks
    WHERE id = p_stock_id;
    
    p_old_value := v_old_market_price;
    p_new_value := v_new_market_price;
    
    UPDATE owned_shares
    SET market_price_LA = v_new_market_price
    WHERE userid = p_userid AND id = p_stock_id;
    
END;
$$;

CREATE OR REPLACE FUNCTION played_game(
    p_userid VARCHAR(100)
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_games_played INT;
BEGIN
    -- Increment games_played by 1
    UPDATE bank_acc
    SET games_played = games_played + 1
    WHERE userid = p_userid
    RETURNING games_played INTO v_games_played;  -- Get the updated games_played value

    -- Check if games_played modulo 10 is 0
    IF v_games_played % 10 = 0 THEN
        -- If true, give the savings account a 10% interest
        UPDATE bank_acc
        SET savings_amt = savings_amt * 1.10
        WHERE userid = p_userid;
    END IF;
END;
$$;