import axios from "axios";
import InvoiceBill from "../TTS/International/Invoice/Export Invoice/InvoiceBill";
import { BackendUrl } from "../../config";

const Home = () => {

  const handleApiCall = async()=>{
    const res = await axios.get(`${BackendUrl}/Invoice/getInvoiceNo`)
    console.log(res.data);
    console.log(res.status);
  }
  return (
 <>
 <div>
  <InvoiceBill/>

  {/* <button onClick={handleApiCall}>get invoice</button> */}
  </div>
 </>
  );
};

export default Home;
