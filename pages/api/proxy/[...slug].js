import Proxy from "http-proxy";

/* eslint-disable */


const proxy = async (req, res) => {
  console.log('iunja')
  console.log(req.url?.split("/api/proxy/")[1]);

  console.log(
    `Proxying to: https://storage.cloud.google.com/scfetch2/${req.url?.split("/api/proxy/")[1]
    }`
  );
  

  const proxy = new Proxy({
    target: `https://storage.cloud.google.com/scfetch2/${req.url?.split("/api/proxy/")[1]
      }`,
    changeOrigin: true,
    ignorePath: true,
    xfwd: true,
    secure: false,
    proxyTimeout: 30_000, // limit proxying to 30 seconds
  });

  await new Promise((proxyResolve, proxyReject) => {
    let finished = false;

    proxy.on("proxyReq", (proxyReq, req) => {
      // @ts-ignore
      if (req.body && req.complete) {
        // @ts-ignore
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.setHeader("Authorization", req.headers.authorization || "");
        proxyReq.write(bodyData);
      }

      proxyReq.on("close", () => {
        if (!finished) {
          finished = true;
          proxyResolve(true);
        }
      });
    });
    proxy.on("error", (err) => {
      if (!finished) {
        finished = true;
        proxyReject(err);
      }
    });
    proxy.web(req, res);
  });
  // return res.status(200).end('OLLA!');
};

/* eslint-enable */

export default proxy;
