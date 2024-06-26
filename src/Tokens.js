import { useState } from 'react';
import Token from './Token';
import './Tokens.css';

function Tokens() {
  let initTrackedTokens = ["intel.tkn.near", "wrap.near"]
  if (window.location.search.length !== 0) {
    const search = new URLSearchParams(window.location.search);
    const tokens = search.getAll('token');
    if (tokens.length > 0) {
      initTrackedTokens = tokens;
    }
  }
  let [trackedTokens, setTrackedTokens] = useState(initTrackedTokens);
  return (
    <div className="tokens">
      {
        trackedTokens.map(token => (
          <Token token={token} key={token} />
        ))
      }
    </div>
  );
}

export default Tokens;