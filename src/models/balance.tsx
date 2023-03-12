import { useState, useCallback } from 'react';

export default () => {
    const [balance, setBalance] = useState(0);
    const saveBalance = useCallback((value) => setBalance(value), []);
    return { balance, saveBalance };
};