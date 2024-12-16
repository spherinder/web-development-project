import { useQuery } from "@tanstack/react-query";
import { fetchMarketsList, fetchUserBalances, fetchUserData } from "../api";
import { useContext } from "react";
import { AuthContext, MarketContext } from "../App";
import { MarketInfoShort, MarketsList, UserBalance } from "../model";
import { Card } from "./Card";
import { useNavigate } from "react-router-dom";

export const UserOverview = () => {
  const { apiToken } = useContext(AuthContext);
  const { setMarket } = useContext(MarketContext);

  const navigate = useNavigate();  

  const { status: userStatus, error: _1, data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: () => fetchUserData(apiToken!)
  });

  const { status: balanceStatus, error: _2, data: balanceData } = useQuery({
    queryKey: ["userBalances"],
    queryFn: () => fetchUserBalances(apiToken!)
  });

  const { status: marketsListStatus, error: _3, data: marketsListData  } = useQuery({
    queryKey: ["marketsList"],
    queryFn: fetchMarketsList,
  });

  const findMarket = (marketId: number): MarketInfoShort | undefined => {
    return marketsListData?.find(({ id }) => id === marketId)
  }
  const marketName = (marketId: number): string => {
    return findMarket(marketId)!.name
  }

  const marketDescription = (marketId: number): string => {
    return findMarket(marketId)!.description
  }

  if (userStatus === "pending" || balanceStatus === "pending" || marketsListStatus === "pending") {
    return <h1>Loading...</h1>
  } else {
    let rendered = balanceData as Array<UserBalance>;
    // TODO: use proper styling for the UI here
    return <div>
             <h1>Balances for {userStatus === "success" ? userData?.username : ""}</h1>
             {rendered.map(data => {
               let market = {
                 id: data.market_id,
                 name: marketName(data.market_id),
                 description: marketDescription(data.market_id)
               };
               return (
                 <Card>
                   <div style={{
                     display: "grid",
                     gridTemplateColumns: "70% 30%",
                   }}>
                     <div>
                       <p>Market #{data.market_id}</p>
                       <h2>{market.name}</h2>
                       <h3>{market.description}</h3>
                     </div>
                     <div>
                       <p>Yes tokens owned: {data.yes_balance.toFixed(2)}</p>
                       <p>No tokens owned: {data.no_balance.toFixed(2)}</p>
                       <button onClick={() => {setMarket(market); navigate("/"); }}
                         style={{
                           margin: "10px",
                           padding: "10px",
                           backgroundColor: "gray"
                         }}>
                         Details
                       </button>
                     </div>
                   </div>
                 </Card>
               )
             })}
           </div>
  }

};
