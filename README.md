# leaflet-tools

### 扩展了一般地图操作，如量算、底图切换、自定义扩展工具。

### 使用方法如下
        L.mapTools({
                controls: [
                    {
                        type: 'measure',
                        label: '测量'
                    },
                    {
                        type: 'basemaps',
                        label: '底图'
                    },
                    {
                        type: 'layerlist',
                        label: '图层'
                    },
                    {
                        type: 'dropdown',
                        label: '图例',
                        icon: '<i class="icon icon-map-o"></i>',
                        fn: function (el) {
                            var legendInfos = [
                                {label: '10', color: '#FFEDA0', size: '15'},
                                {label: '20', color: '#FED976', size: '15'},
                                {label: '30', color: '#FEB24C', size: '15'},
                                {label: '40', color: '#FD8D3C', size: '15'},
                                {label: '50', color: '#FC4E2A', size: '15'},
                                {label: '60', color: '#E31A1C', size: '15'}
                            ];
                            var div = L.DomUtil.create('div', '');
                            // loop through our density intervals and generate a label with a colored square for each interval
                            for (var i = 0, len = legendInfos.length; i < len; i++) {
                                if (legendInfos[i].size) {
                                    var lw, lh, lw = lh = legendInfos[i].size;
                                    div.innerHTML +=
                                            '<span style="display: block;margin: 2px;line-height: ' + lh + 'px"><i style="float: left;margin-right: 5px;background:' + legendInfos[i].color + '; width: ' + lw + 'px;height:' + lh + 'px;"></i> ' +
                                            legendInfos[i].label + '</span>';
                                }
                                else {
                                    div.innerHTML +=
                                            '<span style="display: block;margin: 2px"><i style="float: left;margin-right: 5px;background:' + legendInfos[i].color + ';"></i> ' +
                                            legendInfos[i].label + '</span>';
                                }
                            }
                            div.style.margin = "2px";
                            div.style.overflow = "auto";
                            div.style.maxHeight = "500px";
                            el.appendChild(div);
                        }
                    }
                ]
            }).addTo(map);

