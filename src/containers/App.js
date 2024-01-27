import React , {Suspense} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { Homescreen } from '../pages';
import { Authentication } from '../pages';
import {QueryClient, QueryClientProvider} from "react-query"
import {ReactQueryDevtools} from "react-query/devtools"
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer} from 'react-toastify';


function App() {
  const queryClient= new QueryClient();
  return (
   <QueryClientProvider client={queryClient}>
     <Suspense fallback={<div>...Loading</div>}>
    <Router>
      <Routes>
        <Route path="/*" element={<Homescreen />} />
        <Route path="/auth" element={<Authentication />} />
      </Routes>
    </Router>
    <ToastContainer position="top-right" theme="dark" />
    </Suspense>
    <ReactQueryDevtools initialIsOpen={false} />
   </QueryClientProvider>
  
  )
};

export default App