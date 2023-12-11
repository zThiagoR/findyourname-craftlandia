'use client';

import React, { FormEvent, useState } from 'react';
import Image from 'next/image';

import axios from 'axios';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

type TypeResult = {
  date: string;
  content: string;
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<TypeResult[]>([]);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 

    try {
      const response = await axios.post('/api/users', {
        search: searchTerm,
      });
  
      const data = await response.data;
      setResults(data.results);
    } catch (error: any) {
      toast.error(error.response.data.message, {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "colored",
        
        });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
    <ToastContainer />

     <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <Image src="https://minhaconta.craftlandia.com.br/images/logo.png" width="200" height="200" alt="Craftlandia" />
        <h1 className="text-3xl font-bold mt-4">Buscar seu nome na changelog da Craftlandia!</h1>
      </motion.div>

      <form onSubmit={handleSearch} className="flex flex-row items-center justify-center mt-4 w-full max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Digite um nome..."
          className="flex-1 text-black p-2 rounded-l-lg focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-r-lg transition duration-300"
        >
          Buscar
        </button>
      </form>

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-4 p-4 bg-white text-gray-800 rounded-lg shadow-lg w-full max-w-md"
        >
          <h2 className="text-xl font-semibold">Resultados:</h2>
          <ul className="mt-2 overflow-y-auto max-h-60"> {/* Adiciona rolagem e limita a altura */}
            {results.map((result, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="mb-1 text-blue-700"
              >
                {result.date} {result.content}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </main>
  );
}
