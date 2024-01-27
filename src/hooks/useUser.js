import { useQuery } from "react-query"
import { toast } from "react-toastify"
import { getUserDetail } from "../api";

const useUser = () =>{
    const {data, isLoading , isError ,refetch} = useQuery(
        "user",
        async() =>{
            try{
                const userDetail= await getUserDetail();
                return userDetail;
            }catch(err){
                if(!err.message.includes("Not Authenticated"))
                toast.err("Something Went wrong");

            }
        },{
            refetchOnWindowFocus :false
        }
    );
    return{data, isLoading, isError, refetch}
};

export default useUser;