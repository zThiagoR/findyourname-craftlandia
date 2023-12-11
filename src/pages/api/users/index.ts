/* eslint-disable import/no-anonymous-default-export */
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { load } from 'cheerio';

interface ChangelogEntry {
  date: string;
  content: string;
}

const CHANGELOG_URLS: string[] = [
  'http://changelog.craftlandia.com.br',
  'http://changelog.craftlandia.com.br/Changelog%202020.html',
  'http://changelog.craftlandia.com.br/Changelog%202019.html',
  'http://changelog.craftlandia.com.br/Changelog%202018.html',
  'http://changelog.craftlandia.com.br/Changelog%202017.html',
  'http://changelog.craftlandia.com.br/Changelog%202016.html',
  'http://changelog.craftlandia.com.br/Changelog%202015.html',
  'http://changelog.craftlandia.com.br/Changelog%202014.html',
];

const cache: { [key: string]: ChangelogEntry[] } = {};

async function processUrl(url: string, search: string): Promise<ChangelogEntry[]> {
  const cacheKey = `${url}-${search.toLowerCase()}`;

  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const response = await axios.get(url);
  const $ = load(response.data);
  const results: ChangelogEntry[] = [];

  $("p > span[style*='font-size: 16px;']").each((i, elem) => {
    const date = $(elem).find('strong').text();
    let content = '';

    let nextElem = $(elem).parent().next();
    while (nextElem.length && !nextElem.is("p:has(span[style*='font-size: 16px;'])")) {
      let text = nextElem.text().replace(/[\t\n]+/g, ' ').trim();
      if (text) {
        if (nextElem.find("span[style*='font-size: 16px;']").length) {
          break;
        }

        if (text.toLowerCase().includes(search.toLowerCase())) {
          const keywordRegex = /promovido|aceita|não integra mais|reintegrado|reintegrada|promovida|aceito/i;
          if (keywordRegex.test(text.toLowerCase())) {
            content += `${text}\n`;
          }
        }
      }
      nextElem = nextElem.next();
    }

    if (date && content.length) {
      results.push({ date, content });
    }
  });

  // Armazena os resultados no cache
  cache[cacheKey] = results;

  return results;
}

export default async function(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { search } = req.body;

      if (!search) {
        res.status(400).json({ message: 'Por favor, forneça um termo de busca na query string.' });
        return;
      }

      let allResults: ChangelogEntry[] = [];

      for (const url of CHANGELOG_URLS) {
        const resultsFromUrl = await processUrl(url, search);
        allResults = [...allResults, ...resultsFromUrl];
      }

      if (!allResults.length) {
        res.status(404).json({ message: 'Nenhum resultado encontrado.' });
        return;
      }

      res.status(200).json({ results: allResults });
    } catch (error: any) {
      res.status(500).json({ message: 'Erro ao processar a requisição', error: error.message });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Método Não Permitido');
  }
}