import {createSlice} from '@reduxjs/toolkit'

if(!localStorage.getItem("wishLists"))
    localStorage.setItem("wishLists",JSON.stringify([]))

let dataFromWeb = JSON.parse(localStorage.getItem("wishLists"))

let wishListsSlice = createSlice({
    name:"wishLists",
    initialState:dataFromWeb,
    reducers:{
        addWishLists(state, action){
            state.push(action.payload)
            localStorage.setItem("wishLists",JSON.stringify(state))
        },
        removeWishLists(state,action){
            let newWishLists = state.filter((lists)=>lists.id!==action.payload)
            localStorage.setItem("wishLists",JSON.stringify(newWishLists))
            return newWishLists
        }
    }
})

export default wishListsSlice.reducer

export let{addWishLists,removeWishLists}=wishListsSlice.actions