export default function loadder (AmapData) {
    return new Promise((resolve, reject)=>{
        AMapLoader.load({
            "key": "3257a21ceceb0bcd498b8288f0f10cfa",
            "version": "2.0",
            "plugins": [
                'AMap.ToolBar',
                'AMap.Scale',
                'AMap.ControlBar'
            ], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
        }).then((AMap) => {
            let map = new AMap.Map('container', {
                zoom: 8,//级别
                center: [AmapData.location.split(",")[0], AmapData.location.split(",")[1]],//中心点坐标
                viewMode: '3D',//使用3D视图
                terrain: true
            });
            let infoWindow = new AMap.InfoWindow({
                anchor: 'top-left',
                content: '猜你在这附近!',
            });
            infoWindow.open(map, [AmapData.location.split(",")[0], AmapData.location.split(",")[1]]);
            let marker = new AMap.Marker({
                position: [AmapData.location.split(",")[0], AmapData.location.split(",")[1]]//位置
            });
            map.add(marker);//添加到地图
            map.addControl(new AMap.ToolBar());
            map.addControl(new AMap.Scale());
            map.addControl(new AMap.ControlBar());
            resolve(true);
        }).catch((err) => {
            console.error(err);
            reject(false);
        });
    })
}