import React from "react";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './components/Login';
import RegistrationPage from './components/RegistrationPage';
import LivelinessPrompt from "./components/LivelinessPrompt";
import Homepage from "./components/Homepage";
import ForgotPassword from './components/ForgotPassword'
import CustomerListPage from "./components/CustomerListPage";
import CustomerDetailsPage from "./components/CustomerDetailsPage";
import LivelinessTest from "./components/LivelinessTest";
import BlacklistedUserNotice from "./components/BlacklistedUserNotice";
import Aadhar from "./components/Aadhar";
import CustomerReviewPage from "./components/CustomerReviewPage";
import Doc2 from "./components/Doc2";
import DuplicateUserWarning from "./components/DuplicateUserWarning";
import DocumentDisplayPage from "./components/DocumentDisplayPage";
import ExistingCustomerPage from "./components/ExistingCustomerPage";
import ExistingCustomerLivelinessTest from "./components/ExistingCustomerLivelinessTest";
import AuthGuard from './AuthGuard';

function App(){
return(
<Routes>
<Route path="/" element={<Login />} />
<Route path="/register" element={<RegistrationPage />} />
<Route path="/forgotpass" element={<ForgotPassword />} />

{/* Protected Routes - only accessible after login */}
<Route element={<AuthGuard />}>
<Route path="/home" element={<Homepage />} />
<Route path="/clist" element={<CustomerListPage/>} />
<Route path="/custdetails" element={<CustomerDetailsPage/>} />
<Route path="/livetest" element={<LivelinessTest />} />
<Route path="/blacklist" element={<BlacklistedUserNotice />} />
<Route path="/aadhar" element={<Aadhar />} />
<Route path="/liveprompt" element={<LivelinessPrompt />} />
<Route path="/doc" element={<Doc2/>}/>
<Route path="/custreview" element={<CustomerReviewPage />} />
<Route path="/dupuser" element={<DuplicateUserWarning />} />
<Route path="/docdisplay" element={<DocumentDisplayPage />} />
<Route path="/ecp" element={<ExistingCustomerPage/>} />
<Route path="/existing-livetest" element={<ExistingCustomerLivelinessTest />} />
</Route> {/* End Protected Routes */}
</Routes>
);
}

export default App;