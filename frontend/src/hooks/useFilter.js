import { useMemo } from "react";

export default function useFilter(products, activeCat, rating, search){
    return useMemo(()=>{
        const selectedCat = activeCat
        const selectedRate = Number(rating)||0
        const query = search?.trim().toLowerCase()

        return products.filter((p)=>{
            if (selectedCat && p.productCat.toLowerCase() !==selectedCat) return false

            if(selectedRate>0 && p.productRate<selectedRate) return false

            if(query && !p.productName.toLowerCase().includes(query)) return false

            return true
        })
    },[products,activeCat,rating,search])

}