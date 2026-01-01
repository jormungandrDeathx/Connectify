import {createSlice} from "@reduxjs/toolkit"
const presenceSlice = createSlice({
    name:"presence",
    initialState:{},
    reducers:{
        updatePresence(state,action){
            const {user_id,is_online,last_seen} = action.payload || {}
            if (!user_id) return
            state[user_id]={is_online,last_seen}
        },
        clearPresence(){
            return {}
        }
    }
})

export let {updatePresence, clearPresence} = presenceSlice.actions
export default presenceSlice.reducer