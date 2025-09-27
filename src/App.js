import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import AllDocuments from "./components/loadAllDocuments";
import DocumentPage from "./components/documentPage";
import AddDocumentAction from "./components/addDocument";

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pb-[200px] overflow-y-auto mt-[150px]">
          <Routes>
            <Route path="/" element={<AllDocuments />} />
            <Route path="/addDocument" element={<AddDocumentAction />} />
            <Route path="/doc/:id" element={<DocumentPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;