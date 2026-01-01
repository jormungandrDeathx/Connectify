import { Activity, useEffect, useState } from "react";
import Login from "./Pages/Login";
import Navbar from "./Components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Pages/Signup";
import About from "./Pages/About";
import ContatcUs from "./Pages/ContatcUs";
import PageNotFound from "./Pages/PageNotFound";
import Home from "./Pages/Home"

function App() {
  
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    const cToken = localStorage.getItem("connectify_token");
    if (cToken) setIsLogin(true);
  }, []);
  return (
    <Router>
      <Activity mode={!isLogin ? "visible" : "hidden"}>
        <Routes>
          <Route
            path="/"
            element={<Login isLogin={isLogin} setIsLogin={setIsLogin} />}
          />
          <Route path="/signup" element={<Signup />} />{" "}
          <Route path="/aboutUs" element={<About />} />
          <Route path="/contact" element={<ContatcUs />} />
          <Route path="*" element={<PageNotFound/>}></Route>
        </Routes>
      </Activity>
      <Activity mode={isLogin ? "visible" : "hidden"}>
        <Navbar />
      </Activity>
    </Router>
  );
}

export default App;
