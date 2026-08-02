// routes/sitemapRoutes.js
const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' }).select('_id updatedAt');

    const baseUrl = 'https://handyman-marketplace.vercel.app';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    jobs.forEach((job) => {
      const date = job.updatedAt ? job.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${baseUrl}/jobs/${job._id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;