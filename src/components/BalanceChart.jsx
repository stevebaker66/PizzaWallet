import React from "react";
import { Chart } from "react-charts";
import { useNativeBalance } from "react-moralis";
import { useEffect } from "react";
import { Spin } from "antd";

function BalanceChart() {
    const { data: balance, isLoading } = useNativeBalance(props);

    useEffect(() => {
        
            // 
    }, []);

    console.log(assets);

    const data = React.useMemo(
        () => [
            {
                label: 'Balance',
                data: [[0, 1], [1, 2], [2, 4], [3, 2], [4, 7]]
            }
        ],
        []
    )

    const axes = React.useMemo(
        () => [
            { primary: true, type: 'linear', position: 'bottom' },
            { type: 'linear', position: 'left' }
        ],
        []
    )
    
    if (!account || !isAuthenticated) return null;
    if (isLoading) return <Spin></Spin>;

    return (
        // A react-chart hyper-responsively and continuously fills the available
        // space of its parent element automatically
        <div
            style={{
                width: '100%',
                height: '300px'
            }}
        >
            <Chart data={data} axes={axes} />
        </div>
    )
}

export default BalanceChart;
