import { useEffect, useState } from "react";
import "./Token.css";
import { RPC_URL, PRICE_URL, WEBSOCKET_URL, USD_DECIMALS } from "./config";
import useWebSocket from "react-use-websocket";
import BigNumber from "bignumber.js";
import { AnimatedCounter } from "react-animated-counter";

function Token({ token }) {
    let [price, setPrice] = useState(0);
    let tokens = localStorage.getItem("tokens");
    let savedToken = tokens && JSON.parse(tokens)?.[token];
    let [meta, setMeta] = useState(savedToken || token);
    if (!savedToken) {
        fetch(RPC_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "id": "dontcare",
                "method": "query",
                "params": {
                    "request_type": "call_function",
                    "finality": "final",
                    "account_id": token,
                    "method_name": "ft_metadata",
                    "args_base64": btoa(JSON.stringify({})),
                }
            })
        })
            .then((res) => res.json())
            .then((res) => {
                let result = res.result.result;
                let resultString = new TextDecoder().decode(Uint8Array.from(result));
                let metadata = JSON.parse(resultString);
                setMeta({ symbol: metadata.symbol, decimals: metadata.decimals });
                let tokens = localStorage.getItem("tokens");
                let tokensObj = tokens ? JSON.parse(tokens) : {};
                tokensObj[token] = { symbol: metadata.symbol, decimals: metadata.decimals };
                localStorage.setItem("tokens", JSON.stringify(tokensObj));
            });
    }
    useEffect(() => {
        fetch(PRICE_URL + `/price?token_id=${token}`)
            .then((res) => res.text())
            .then((res) => parseFloat(res))
            .then((res) => setPrice(res));
    }, [token]);
    useWebSocket(`${WEBSOCKET_URL}/events/price_token`, {
        onOpen: (event) => {
            event.target.send(JSON.stringify({ token }));
        },
        onMessage: (event) => {
            let data = JSON.parse(event.data);
            if (data.token === token) {
                let price_usd = new BigNumber(data.price_usd).multipliedBy(new BigNumber(10).pow(meta.decimals - USD_DECIMALS)).toNumber();
                setPrice(price_usd);
            }
        }
    });

    let formatter = new Intl.NumberFormat('en-US', {
        minimumSignificantDigits: 4,
        minimumFractionDigits: 2,
        maximumSignificantDigits: 6,
    });
    return (
        <div>
            <div className="name">{meta.symbol}</div>
            <AnimatedCounter className="price" decimalPrecision={formatter.format(price).split(".")[1].length} value={formatter.format(price)} />
        </div>
    );
}

export default Token;
