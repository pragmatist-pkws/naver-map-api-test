export default async function handler(req, res) {
  const { center, zoom, w, h, markers } = req.query;
  if (!center || !zoom) {
    return res.status(400).json({ error: 'center and zoom parameters required' });
  }

  const params = new URLSearchParams({
    center,
    zoom,
    w: w || '800',
    h: h || '600',
    'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_CLIENT_ID,
  });
  if (markers) params.set('markers', markers);

  try {
    const apiRes = await fetch(
      `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?${params}`,
      {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_CLIENT_ID,
          'X-NCP-APIGW-API-KEY': process.env.NAVER_CLIENT_SECRET,
        },
      }
    );

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return res.status(apiRes.status).send(text);
    }

    const buffer = Buffer.from(await apiRes.arrayBuffer());
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
