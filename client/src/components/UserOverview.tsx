import { useQuery } from "@tanstack/react-query";
import { fetchUserData } from "../api";
import { useContext } from "react";
import { AuthContext } from "../App";

export const UserOverview = () => {
    const { apiToken } = useContext(AuthContext);

    const { status: userStatus, error: _, data: userData } = useQuery({
        queryKey: ["userData"],
        queryFn: () => fetchUserData(apiToken!)
    });

    if (userStatus === "pending") {
        return <h1>Loading...</h1>
    } else {

        return <h1>Hello, ${userStatus === "success" ? userData?.username : ""}</h1>
    }

};
