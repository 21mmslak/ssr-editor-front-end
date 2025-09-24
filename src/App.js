import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import AllDocuments from "./components/loadAllDocuments";
import DocumentPage from "./components/documentPage";
import AddDocumentAction from "./components/addDocument";

function App() {
  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pb-[200px] overflow-y-auto mt-[150px]">
            <Routes>
                <Route path="/ssr-editor-front-end/" element={<AllDocuments />} />
                <Route path="/ssr-editor-front-end/addDocument" element={<AddDocumentAction />} />
                <Route path="/ssr-editor-front-end/doc/:id" element={<DocumentPage />} />
            </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;