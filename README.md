# 中国城市图鉴

十城经济、产业、公共资源、手绘图、生活试算和主题漫游的中文交互网站。
本版加入2024／2025经济年份切换、人口与全体居民收入、真实地图与地理查询、个人账户档案、月度气候日历和城市群关系。

## 运行

```sh
npm ci
npm run db:local
npm run build
npm run dev
```

预览在端口8787。首次迁移前也可先构建。`server/local.js`仅为本地预览注入独立身份；生产构建只打包`server/worker.js`，身份来自Sites平台的已认证用户请求头。

`public/`保留原生HTML/CSS/JavaScript页面。构建输出为`dist/client/`静态资源和`dist/server/index.js` Worker。Sites保留原项目和访问范围，并配置逻辑D1绑定`DB`。`db/schema.ts`与Drizzle迁移管理档案表；生产运行时不修改表结构。

档案按用户ID隔离，保存使用乐观版本检查，冲突时不覆盖另一个设备的版本。预算、偏好、收藏和漫游进度保存到D1，浏览器存储不承担产品数据持久化。地图候选和在线气候数据只驻留本次页面。

## 数据与依赖

- 经济证据在`public/economy-evidence.json`；2025公报为公开GitHub转载存档，非本次直接访问统计局原站。收入为全年全体居民人均可支配收入。
- 气候存档在`public/climate-evidence.json`；统计期逐城列出，缺失为null。苏州和杭州的月度存档暂缺，部分城市缺降水或气温；没有插值或借用邻城。
- 气候页可在线读取Open-Meteo ERA5 1991—2020逐日资料，汇总为月度常态；是格点再分析，日照为模型估算。来源Open-Meteo / ECMWF ERA5（CC BY 4.0）。在线服务故障时保留现有存档。
- 真实底图使用OpenStreetMap（ODbL）和Leaflet（BSD-2-Clause），具体地点由用户显式查询Nominatim并选择候选。高德入口按名称检索，避免混用坐标系统。
- 步行／交通片段、宜居参考档位、城市群联系、未来驱动力均为编辑分析，未计算导航耗时或真实跨城流量。
- 原有手绘图为AI生成概念示意，不作为导航底图。

部署通过现有Sites项目发布，GitHub镜像为[jggagi/china-cities](https://github.com/jggagi/china-cities)。不要用Wrangler创建或部署另一个云端数据库或站点。
