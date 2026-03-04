import { createSlice } from "@reduxjs/toolkit";

const initialState = {
listOfProformaInvoice:[]
}

const proformaInvoice = createSlice({
    name:'proformainvoice',
    reducers: {
        setListOfProformaInvoice: (state,action) => {
            state.listOfProformaInvoice = action.payload
        },
    }
})



export const {} = proformaInvoice.actions

export default proformaInvoice.reducer