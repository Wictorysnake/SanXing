/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "1b7408c3e62c69528e85cb6d1d3fd4ae"
  },
  {
    "url": "Algorithm/动态规划.html",
    "revision": "d9e759fe83259d0552d33bbd3549751e"
  },
  {
    "url": "assets/css/0.styles.daf0320f.css",
    "revision": "7f96de008d62e200ef766853b3ea924e"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/1.d1b4024e.js",
    "revision": "605a7ebafab7b4e493bf7ff8470c9837"
  },
  {
    "url": "assets/js/10.32980f0a.js",
    "revision": "e33fd4c8300dff15e494ab8ab061010c"
  },
  {
    "url": "assets/js/11.eb2a126a.js",
    "revision": "501194acd43c56a51015fdfa209b0db5"
  },
  {
    "url": "assets/js/12.54038309.js",
    "revision": "ef9c833384f6a6be9afba2976e61f768"
  },
  {
    "url": "assets/js/13.7d7f29b0.js",
    "revision": "037316d17ada092abfe86b8cf893a3a0"
  },
  {
    "url": "assets/js/14.359db0fe.js",
    "revision": "d4fd3f1b922408077f14f21351487ef0"
  },
  {
    "url": "assets/js/15.52699734.js",
    "revision": "175b41704b1124ac90866f98922dfeff"
  },
  {
    "url": "assets/js/16.32cbe081.js",
    "revision": "73d9247240f70202417b3cf676c2597d"
  },
  {
    "url": "assets/js/17.df0a580f.js",
    "revision": "b99937f5f96e82926a1d82d6b512ebd4"
  },
  {
    "url": "assets/js/18.c3b793bb.js",
    "revision": "694e111af15624689bbf2cce9d4fd4ac"
  },
  {
    "url": "assets/js/19.60baaf1b.js",
    "revision": "4f1db96654e1fe5c3e5b35a4c91e4b94"
  },
  {
    "url": "assets/js/2.d389be3a.js",
    "revision": "5de635d9deda0e639f020228ed965159"
  },
  {
    "url": "assets/js/20.d7594023.js",
    "revision": "0d51e201a28ccf0c4320c907c48a5df7"
  },
  {
    "url": "assets/js/21.b0e35f20.js",
    "revision": "4bb507881180616b1e9d2926ead1d7aa"
  },
  {
    "url": "assets/js/22.94fd10ec.js",
    "revision": "14df1941783f37a3075cf494643b6283"
  },
  {
    "url": "assets/js/23.72c807ab.js",
    "revision": "a2bfcb47ba9240271c97bd78c6cdaeb6"
  },
  {
    "url": "assets/js/24.d10c573b.js",
    "revision": "c7b1b5cf0b6cc8f47b4151eff6ab8db3"
  },
  {
    "url": "assets/js/25.eb4e0975.js",
    "revision": "573d1d66cab8747a817cf1c221e5fcb1"
  },
  {
    "url": "assets/js/26.3cded005.js",
    "revision": "ad73c52917d967b701fc64a29668365a"
  },
  {
    "url": "assets/js/27.f41e2f3a.js",
    "revision": "b8f62ffa2a2ec9bfdb4246c8a257fa92"
  },
  {
    "url": "assets/js/28.c48cf13c.js",
    "revision": "0ccfdeea90b40936e3884a926d8cd148"
  },
  {
    "url": "assets/js/29.98c0ae72.js",
    "revision": "0ebefea02b6d9cddbda14833c1425d51"
  },
  {
    "url": "assets/js/3.27ac6cca.js",
    "revision": "bc97c41d948c0e4def96535541638637"
  },
  {
    "url": "assets/js/30.bfb04fae.js",
    "revision": "a6f2ae87c5ec17773c7eb6d1120e74af"
  },
  {
    "url": "assets/js/31.4bc87b01.js",
    "revision": "e9199d9f9d882d088e41444ecc5b4907"
  },
  {
    "url": "assets/js/32.7b065190.js",
    "revision": "dc72823006462102d28f5d7a6859fad2"
  },
  {
    "url": "assets/js/33.b00a79f1.js",
    "revision": "9c74e74b8d5d2fb8c9a0f00d87cf0ff7"
  },
  {
    "url": "assets/js/34.3240136a.js",
    "revision": "a78b03ee74c3062c955956db91af3879"
  },
  {
    "url": "assets/js/35.e5f038af.js",
    "revision": "d1d86f4bb5dcbeea674053812f7c0f89"
  },
  {
    "url": "assets/js/36.c2c3d6b3.js",
    "revision": "59d59f5621040f3dcca8a576455e2403"
  },
  {
    "url": "assets/js/37.71150f2e.js",
    "revision": "e2c011e4868480ddc7d23c695cacf825"
  },
  {
    "url": "assets/js/38.c69852bc.js",
    "revision": "467d2ed61209596de332ed2fe5622833"
  },
  {
    "url": "assets/js/39.f5824c0a.js",
    "revision": "ba6e048cd416b61c523c4827c8e17fe3"
  },
  {
    "url": "assets/js/4.d2156d6e.js",
    "revision": "a42581ac1546ecc1bdc540cb45fd52c6"
  },
  {
    "url": "assets/js/40.e25351a9.js",
    "revision": "dabba9b6a633608c98059b7a13f6ee98"
  },
  {
    "url": "assets/js/41.08f8db12.js",
    "revision": "94a4e5f2ff6c4963d73873e97f604d4a"
  },
  {
    "url": "assets/js/42.bca2317c.js",
    "revision": "a0bc9576033e6df6ff438e7e6c38b574"
  },
  {
    "url": "assets/js/43.d98447a2.js",
    "revision": "cf23950e74383a0f9753cc7a7d1cac35"
  },
  {
    "url": "assets/js/44.04568d41.js",
    "revision": "788bda51712e5cb0e71eec7ef98be87a"
  },
  {
    "url": "assets/js/45.c38032aa.js",
    "revision": "c8e97efdd974ac42f2dd18216ae50ab5"
  },
  {
    "url": "assets/js/46.ef396107.js",
    "revision": "e265078f4769aa160ac018f1d929e693"
  },
  {
    "url": "assets/js/47.a83890de.js",
    "revision": "775e45ba65b58cbccdd5d533ad39686e"
  },
  {
    "url": "assets/js/48.725c1f08.js",
    "revision": "3011ef114d6f0111f89fcc4be323c0ad"
  },
  {
    "url": "assets/js/49.e6d87934.js",
    "revision": "fb91a7f8b44be99086e4abe3af2fb60c"
  },
  {
    "url": "assets/js/5.d92fff2b.js",
    "revision": "636edbc08891b33e2215e7b5d6ed2241"
  },
  {
    "url": "assets/js/50.83e22a48.js",
    "revision": "60a603e46f4cf295435b5a9fa6c966df"
  },
  {
    "url": "assets/js/51.4bce7a4a.js",
    "revision": "e1e0a95b60cd7afe5cd27a8a3c947bb8"
  },
  {
    "url": "assets/js/52.fbc4995f.js",
    "revision": "987c6765ec036441761e628f059c2559"
  },
  {
    "url": "assets/js/53.5e5570e5.js",
    "revision": "5b04fb1309459e2f322d3ec2049fe0d7"
  },
  {
    "url": "assets/js/54.0510fa7f.js",
    "revision": "d70531ba56a36903ce20889f43934fb6"
  },
  {
    "url": "assets/js/55.74f82cb8.js",
    "revision": "4e1a9b6ee56c0e72171162ab74f7305e"
  },
  {
    "url": "assets/js/56.37efd90d.js",
    "revision": "20a85577e14b3af735d97adb5d9e4a0f"
  },
  {
    "url": "assets/js/6.a3bf8472.js",
    "revision": "2b79bfa99d6d92731135e9e108914ca1"
  },
  {
    "url": "assets/js/7.abd5cd51.js",
    "revision": "c863e182e8b090baae25d186649a2599"
  },
  {
    "url": "assets/js/app.a9cd3586.js",
    "revision": "5fe9ae23fbe133413e4c25983f3ec633"
  },
  {
    "url": "assets/js/vendors~docsearch.8ee43d73.js",
    "revision": "a8517086caaf81ffbd692a55932a3cff"
  },
  {
    "url": "CSS/元素水平垂直居中.html",
    "revision": "dba9d0ea2baf787ecde0968f6deba2fd"
  },
  {
    "url": "Engineering/前端模块化.html",
    "revision": "880340547f6eab035aabcdc1fd8e9f02"
  },
  {
    "url": "FrontendSecurity/web安全攻击手段有哪些及如何防范.html",
    "revision": "0c5afa263b952ab6b52242b2bcb036c3"
  },
  {
    "url": "Guide/getting-started.html",
    "revision": "2e3f4ca8ed56013cdf4616c430a2ae6f"
  },
  {
    "url": "HTML/DOCTYPE.html",
    "revision": "eb4a5fa540cdfbfa82699173b7e6940e"
  },
  {
    "url": "index.html",
    "revision": "d8747f86fa951d2febcaca0eab92fba4"
  },
  {
    "url": "JavaScript/Call、Apply、Bind.html",
    "revision": "2eb8ed7e3340013f574199178d90c1d3"
  },
  {
    "url": "JavaScript/Class.html",
    "revision": "ace6ab7b5918de855ae75bd5e39a376a"
  },
  {
    "url": "JavaScript/Decorator.html",
    "revision": "90ae530bc41fb1295eb2a0eccd0c3f94"
  },
  {
    "url": "JavaScript/ES6新增的数据类型.html",
    "revision": "05dae94a9f21d6e6f2573551901ef9dd"
  },
  {
    "url": "JavaScript/Promise.html",
    "revision": "2e7183228d65b7960928b72a47a89870"
  },
  {
    "url": "JavaScript/Proxy.html",
    "revision": "20961cc42e439dbb6960a2e83123dd16"
  },
  {
    "url": "JavaScript/var、let、const.html",
    "revision": "6950fcaaeb8dd4a99de925be9297f208"
  },
  {
    "url": "Life/空窗期如何准备面试.html",
    "revision": "2f6fffd24781540c5083759673b50926"
  },
  {
    "url": "Network/前端缓存.html",
    "revision": "5bf2173bff73419308b1cbe4c25c49d5"
  },
  {
    "url": "OperationMaintenance/原生之初.html",
    "revision": "e4e971aa445830c4effff9b99093bc84"
  },
  {
    "url": "PerformanceOptimization/记一次性能优化.html",
    "revision": "91eff2787106c947854670c0e4d9faca"
  },
  {
    "url": "Test/jest篇.html",
    "revision": "af2445dc35e7cfea0446639d84af3a13"
  },
  {
    "url": "VSCode/debug篇.html",
    "revision": "b3c7d25c3d74cbbf191be451f826650c"
  },
  {
    "url": "Vue/keepalive.html",
    "revision": "7069c2eace1eada9b5e1fc6bb044b2aa"
  },
  {
    "url": "Vue/lifecycle.png",
    "revision": "6f2c97f045ba988851b02056c01c8d62"
  },
  {
    "url": "Vue/nextTick.html",
    "revision": "4afb543f11fa758f48eaf4676dab77ad"
  },
  {
    "url": "Vue/vue-router的模式.html",
    "revision": "09259378440564a85509d49163f46dec"
  },
  {
    "url": "Vue/vue-router的钩子.html",
    "revision": "d0942a0f9cec85dd4cefbcba6a51e1f2"
  },
  {
    "url": "Vue/Vue.use.html",
    "revision": "62070ca7d8ab708abd1c8572443b22cd"
  },
  {
    "url": "Vue/vue2源码解读（1）.html",
    "revision": "8ea63f4821efb470c2816ae0b386518f"
  },
  {
    "url": "Vue/vue2源码解读（2）.html",
    "revision": "c146e8856cc177694ddbf5089ccc1268"
  },
  {
    "url": "Vue/vue2源码解读（3）.html",
    "revision": "b2a38ef10fdcc14ac69cc1f58442a502"
  },
  {
    "url": "Vue/vue2源码解读（4）.html",
    "revision": "a6b201e25d7d003285bb3135fe479083"
  },
  {
    "url": "Vue/vuex.png",
    "revision": "288a0dc913bab3fe765baf18fb4bac27"
  },
  {
    "url": "Vue/vuex简述.html",
    "revision": "a1c0d82c00e662ccd0b729b333e0e857"
  },
  {
    "url": "Vue/vue初始化.html",
    "revision": "a04aa0df42e75a9151e99e042d6d4c59"
  },
  {
    "url": "Vue/生命周期及其使用场景.html",
    "revision": "928a35a402151c6353431c025161b06b"
  },
  {
    "url": "Vue/组件通信.html",
    "revision": "8da64eaaf9c6376c7fb15d4c63a428d0"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
