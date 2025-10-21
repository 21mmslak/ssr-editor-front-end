import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import AllDocuments from "./components/loadAllDocuments";
import DocumentPage from "./components/documentPage";
import AddDocumentAction from "./components/addDocument";
import LoginForm from "./components/loginForm";
import RegisterForm from "./components/registerForm";

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pb-[200px] overflow-y-auto mt-[100px]">
          <Routes>
            <Route path="/" element={<AllDocuments />} />
            <Route path="/addDocument/:type" element={<AddDocumentAction />} />
            <Route path="/doc/:id" element={<DocumentPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
