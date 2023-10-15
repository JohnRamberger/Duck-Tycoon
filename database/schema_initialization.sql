CREATE TABLE users (
    username VARCHAR(40) NOT NULL,
    userid VARCHAR(100) NOT NULL,
    days_school_left INT,
    days_work_left INT,
    salary DECIMAL(10,2),
    net_worth_LA DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (userid)
);

CREATE TABLE bank_acc (
    userid VARCHAR(100) NOT NULL,
    checking_amt DECIMAL(10,2) NOT NULL,
    savings_amt DECIMAL(10,2) NOT NULL,
    amt_chk_LA DECIMAL(10,2) NOT NULL,
    amt_sav_LA DECIMAL(10,2) NOT NULL,
    games_played INT NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid)
);

CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    tot_num_shares BIGINT NOT NULL,
    market_price DECIMAL(20,2) NOT NULL,
    shares_avail BIGINT NOT NULL
);

CREATE TABLE owned_shares (
    userid VARCHAR(100) NOT NULL,
    id INT NOT NULL,
    num_shares_owned BIGINT NOT NULL,
    input_investment DECIMAL(20,2) NOT NULL,
    market_price_LA DECIMAL(20,2) NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (id) REFERENCES stocks(id),
	PRIMARY KEY (userid, id)
);

INSERT INTO stocks(name, tot_num_shares, market_price, shares_avail) VALUES ('JOHN', 300, 3, 300);
INSERT INTO stocks(name, tot_num_shares, market_price, shares_avail) VALUES ('ALEX', 80, 1.20, 80);
INSERT INTO stocks(name, tot_num_shares, market_price, shares_avail) VALUES ('RDZG', 90, 3, 90);
INSERT INTO stocks(name, tot_num_shares, market_price, shares_avail) VALUES ('SEAN', 100, 0.80, 100);
INSERT INTO stocks(name, tot_num_shares, market_price, shares_avail) VALUES ('ALEN', 5, 500, 5);
INSERT INTO stocks(name, tot_num_shares, market_price, shares_avail) VALUES ('FAZE', 5000, 0.01, 5000);