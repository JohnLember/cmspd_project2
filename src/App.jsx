import { Routes, Route } from "react-router";

function App() {

  return (
   <Routes>
      <Route path="/" element={<h1 className="text-blue-600">Hello, World!</h1>} />
   </Routes>
  )
}

export default App
