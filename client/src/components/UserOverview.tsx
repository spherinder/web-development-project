import { useQuery } from "@tanstack/react-query";
import { fetchUserBalances, fetchUserData } from "../api";
import { useContext } from "react";
import { AuthContext } from "../App";
import { UserBalance } from "../model";

export const UserOverview = () => {
    const { apiToken } = useContext(AuthContext);

    const { status: userStatus, error: _1, data: userData } = useQuery({
        queryKey: ["userData"],
        queryFn: () => fetchUserData(apiToken!)
    });

    const { status: balanceStatus, error: _2, data: balanceData } = useQuery({
        queryKey: ["userBalances"],
        queryFn: () => fetchUserBalances(apiToken!)
    });


    if (userStatus === "pending" || balanceStatus === "pending") {
        return <h1>Loading...</h1>
    } else {
        let rendered = balanceData as Array<UserBalance>;
        // TODO: use proper styling for the UI here
        return <div>
            <h1>Balances for {userStatus === "success" ? userData?.username : ""}</h1>
            {rendered.map(data => {
                return <div>
                    <ul>
                        <li>Market: #{data.market_id}</li>
                        <li>Yes tokens owned: {data.yes_balance}</li>
                        <li>No tokens owned: {data.no_balance}</li>
                    </ul>
                </div>
            })}
        </div>
    }

};
