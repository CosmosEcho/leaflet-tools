/**
 * Created by Jack on 2016/11/4.
 */
L.MapTools = L.Control.extend({
    options: {
        position: 'topright'
    },

    initialize: function (options) {
        if (L.version < '0.7') {
            throw new Error('Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/');
        }
        options['controls'] = 'controls' in options ? options.controls : [
            {
                type: 'measure',
                label: '测量',
                fn: function () {

                }
            },
            {
                type: 'basemaps',
                label: '底图',
                fn: function () {

                }
            },
            {
                type: 'layerlist',
                label: '图层',
                fn: function () {

                }
            }
            //,
            //{
            //    type: 'button',
            //    label: '',
            //    icon: '',
            //    fn: function () {
            //
            //    }
            //},
            //{
            //    type: 'toggle',
            //    label: '',
            //    icon: '',
            //    fn: function () {
            //
            //    }
            //},
            //{
            //    type: 'dropdown',
            //    label: '',
            //    icon: '',
            //    fn: function () {
            //
            //    }
            //}
        ];
        options['position'] = 'position' in options ? options.position : 'topright';
        L.setOptions(this, options);
    },

    onAdd: function (map) {
        var _this = this, _map = this._map = map, stop = L.DomEvent.stopPropagation;
        var controls = this.options.controls;
        this._container = L.DomUtil.create('div', 'map-tools-container');
        var _tools = this._tools = L.DomUtil.create('div', 'map-tools', this._container),
            _isOpen = this._isOpen = false;
        if (this.options.position === 'topright' || this.options.position === 'bottomright') {
            this._tools.style.float = 'right';
        }

        //Expand
        var expandBtn = L.DomUtil.create('button', 'tools-button', this._tools);
        expandBtn.innerHTML = '<i class="icon icon-chevron-right"></i>';
        L.DomEvent
            .on(expandBtn, 'click', stop)
            .on(expandBtn, 'click', function () {
                //_container.style.transition = "none";
                //_container.style.transition = "width "+ 35 +"ms";
                if (_tools.style.width === '38px') {
                    _tools.style.width = 'auto';
                    _tools.style.height = 'auto';
                    var expand_i = this.getElementsByTagName('i');
                    expand_i[0].className = "icon icon-chevron-right";
                }
                else {
                    _tools.style.width = 38 + 'px';
                    _tools.style.height = 32 + 'px';
                    var expand_i = this.getElementsByTagName('i');
                    expand_i[0].className = "icon icon-list-ul";
                }
            });

        //Controls
        this._menuContainer = L.DomUtil.create('div', 'map-tools-container map-tools-pop', this._container);
        if (this.options.position === 'topright' || this.options.position === 'bottomright') {
            this._menuContainer.style.float = 'right';
            this._menuContainer.style.clear = 'both';
        }

        for (var c = 0, c_len = controls.length; c < c_len; c++) {
            if (controls[c].type === 'measure') {
                //Measurement
                var measureBtn = L.DomUtil.create('button', 'tools-button', this._tools);
                measureBtn.innerHTML = '<i class="icon icon-ruler"></i>' + controls[c].label;
                L.DomEvent
                    .on(measureBtn, 'click', stop)
                    .on(measureBtn, 'dblclick', stop)
                    .on(measureBtn, 'click', this._toggleMeasure, this);
            }
            else if (controls[c].type === 'basemaps') {
                var bm_btn = L.DomUtil.create('button', 'tools-button dropdown-button', this._tools),
                    menuContainer = L.DomUtil.create('div', 'dropdown-menu', this._menuContainer),
                    baseLayer;
                bm_btn.innerHTML = '<i class="icon icon-background"></i>' + controls[c].label;
                L.DomEvent
                    .on(bm_btn, 'click', stop)
                    .on(bm_btn, 'dblclick', stop)
                    .on(bm_btn, 'click', function () {
                        //if (!isOpen) {
                        //    isOpen = true;
                        //    menuContainer.style.display = "block";
                        //    this.className = this.className + ' selected';
                        //}
                        //else {
                        //    isOpen = false;
                        //    menuContainer.style.display = "none";
                        //    this.className = this.className.replace(' selected', '');
                        //}
                        _this._dropdownOpen(bm_btn, menuContainer);
                    });

                var basemaps = this._createBaseMaps();
                for (var i = 0, len = basemaps.length; i < len; i++) {
                    var label = document.createElement('label'), input = document.createElement('input');
                    input.className = 'input-blue';
                    input.setAttribute("id", _map._container.getAttribute('id') + "_bm" + i);
                    input.setAttribute("name", _map._container.getAttribute('id') + "-bm-group");
                    basemaps[i]['show'] = 'show' in basemaps[i] ? basemaps[i].show : false;
                    if (('show' in basemaps[i]) && basemaps[i].show) {
                        input.setAttribute("checked", "checked");
                        baseLayer = basemaps[i].layer;
                    }
                    input.setAttribute("value", basemaps[i].id);
                    input.type = 'radio';
                    menuContainer.appendChild(input);
                    label.setAttribute("for", _map._container.getAttribute('id') + "_bm" + i);
                    label.className = 'vertical';
                    label.innerHTML = basemaps[i].label;
                    menuContainer.appendChild(label);

                    L.DomEvent
                        .on(input, 'click', stop)
                        .on(input, 'dblclick', stop)
                        .on(input, 'click', function (e) {
                            for (var i = 0, len = basemaps.length; i < len; i++) {
                                if (this.getAttribute('value') === basemaps[i].id) {
                                    if (_map.hasLayer(baseLayer))_map.removeLayer(baseLayer);
                                    baseLayer = basemaps[i].layer;
                                    _map.addLayer(baseLayer);
                                }
                            }
                            this._baseLayerId = L.stamp(baseLayer);
                        });
                }
                this._baseLayerId = L.stamp(baseLayer);
                if (baseLayer)_map.addLayer(baseLayer);
            }
            else if (controls[c].type === 'layerlist') {
                var ll_btn = L.DomUtil.create('button', 'tools-button dropdown-button', this._tools),
                    layersContainer = this._layerListContainer = L.DomUtil.create('div', 'dropdown-menu', this._menuContainer);
                layersContainer.style.maxHeight = '400px';
                layersContainer.style.overflowY = 'auto';
                layersContainer.style.padding = '5px';
                ll_btn.innerHTML = '<i class="icon icon-layer"></i>' + controls[c].label;
                L.DomEvent
                    .on(ll_btn, 'click', stop)
                    .on(ll_btn, 'dblclick', stop)
                    .on(ll_btn, 'click', function () {
                        _this._dropdownOpen(ll_btn, layersContainer);
                    });
            }
            else if (controls[c].type === 'select') {
                var s_btn = L.DomUtil.create('button', 'tools-button dropdown-button', this._tools),
                    selectContainer = this._layerListContainer = L.DomUtil.create('div', 'dropdown-menu', this._menuContainer);
                selectContainer.style.maxHeight = '400px';
                selectContainer.style.overflowY = 'auto';
                selectContainer.style.padding = '5px';
                s_btn.innerHTML = '<i class="icon icon-mouse-pointer"></i>' + controls[c].label;

                L.DomEvent
                    .on(s_btn, 'click', stop)
                    .on(s_btn, 'dblclick', stop)
                    .on(s_btn, 'click', function () {
                        _this._dropdownOpen(s_btn, selectContainer);
                        _this._createSelectPanel(selectContainer);
                    });
            }
            else if (controls[c].type === 'print') {
                var print_btn = L.DomUtil.create('button', 'tools-button', this._tools);
                print_btn.id = 'leafletEasyPrint';
                print_btn.title = '';
                print_btn.innerHTML = '<i class="icon icon-print"></i>' + controls[c].label;

                L.DomEvent
                    .on(print_btn, 'click', stop)
                    .on(print_btn, 'dblclick', stop)
                    .on(print_btn, 'click', this._print, this);
            }
            else if (controls[c].type === 'dropdown') {
                var dp_btn = L.DomUtil.create('button', 'tools-button dropdown-button', this._tools),
                    dp_container = L.DomUtil.create('div', 'dropdown-menu', this._menuContainer);
                dp_btn.innerHTML = controls[c].icon + controls[c].label;
                //menuContainer.innerHTML = '<div><input id="radio-1" class="switch" type="radio" name="r-group-1" checked="checked" /></div>';
                //L.DomEvent
                //    .on(dp_btn, 'click', stop)
                //    .on(dp_btn, 'dblclick', stop)
                //    .on(dp_btn, 'click', function () {
                //        _this._dropdownOpen(dp_btn, dp_container);
                //    });
                _this._dropdownEvent(dp_btn, dp_container);
                if (controls[c].fn)controls[c].fn(dp_container);
            }
        }

        //document.onclick = function (e) {
        //    var realTarget = e.realTarget || e.target;
        //    if (realTarget && realTarget.getAttribute('tag') === 'layerlist') {
        //        return;
        //    }
        //    _this._dropdownClose();
        //};

        //var stop = L.DomEvent.stopPropagation;
        //L.DomEvent
        //    .on(this._btn2, 'click', stop)
        //    .on(this._btn2, 'click', function () {
        //        $(this._btn2).toggleClass('selected');
        //        var selectedCss = this.className;
        //        //有more属性
        //        if (selectedCss != null && selectedCss.indexOf(' selected') > -1) {
        //            this.className = this.className.replace(' selected', '');
        //        } else {
        //            this.className = this.className + ' selected';
        //        }
        //    });
        //    .on($search_input[0], 'mousedown', stop)
        //    .on($search_input[0], 'dblclick', stop)
        //    .on($search_input[0], 'click', L.DomEvent.preventDefault);
        //map
        //    .on('layeradd', this._onLayerChange, this)
        //    .on('layerremove', this._onLayerChange, this);
        return this._container;
    },

    onRemove: function (map) {
        //map
        //    .off('layeradd', this._onLayerChange, this)
        //    .off('layerremove', this._onLayerChange, this);
    },

    _dropdownEvent: function (btn, container) {
        var _this = this, stop = L.DomEvent.stopPropagation;
        L.DomEvent
            .on(btn, 'click', stop)
            .on(btn, 'dblclick', stop)
            .on(btn, 'click', function () {
                _this._dropdownOpen(btn, container);
            });
    },

    _dropdownOpen: function (currentBtn, currentDp) {
        if (!this._isOpen) {
            this._isOpen = true;

            currentDp.style.display = "block";
            currentBtn.className = currentBtn.className + ' selected';
        }
        else if (currentDp.style.display === "block") {
            currentDp.style.display = "none";
            currentBtn.className = currentBtn.className.replace(' selected', '');
        }
        else {
            this._dropdownClose();
            this._isOpen = true;

            currentDp.style.display = "block";
            currentBtn.className = currentBtn.className + ' selected';
        }
    },
    _dropdownClose: function () {
        this._isOpen = false;
        var dp_menu = this._container.getElementsByClassName('dropdown-menu'),
            dp_btn = this._container.getElementsByClassName('dropdown-button');
        for (var i_dpm = 0, len_dpm = dp_menu.length; i_dpm < len_dpm; i_dpm++) {
            dp_menu[i_dpm].style.display = "none";
        }
        for (var i_dpb = 0, len_dpb = dp_btn.length; i_dpb < len_dpb; i_dpb++) {
            dp_btn[i_dpb].className = dp_btn[i_dpb].className.replace(' selected', '');
        }
    },

    //BaseMaps
    _createBaseMaps: function () {
        //var isDOM = ( typeof HTMLElement === 'object' ) ?
        //    function (parent) {
        //        return parent instanceof HTMLElement;
        //    } :
        //    function (parent) {
        //        return parent && typeof parent === 'object' && parent.nodeType === 1 && typeof parent.nodeName === 'string';
        //    };
        //if (!isDOM)return;

        var normalm1 = this._chinaProvider('Geoq.Normal.Map', {
                maxZoom: 18,
                minZoom: 2
            }),
            normalm2 = this._chinaProvider('Geoq.Normal.Color', {
                maxZoom: 18,
                minZoom: 2
            }),
            normalm3 = this._chinaProvider('Geoq.Normal.PurplishBlue', {
                maxZoom: 18,
                minZoom: 2
            }),
            normalm4 = this._chinaProvider('Geoq.Normal.Gray', {
                maxZoom: 18,
                minZoom: 2
            }),
            normalm5 = this._chinaProvider('Geoq.Normal.Warm', {
                maxZoom: 18,
                minZoom: 2
            }),
            normalm6 = this._chinaProvider('Geoq.Normal.Cold', {
                maxZoom: 18,
                minZoom: 2
            });
        var gaode = this._chinaProvider('GaoDe.Normal.Map', {
                maxZoom: 18,
                minZoom: 2
            }),
            gaode_imgm = this._chinaProvider('GaoDe.Satellite.Map', {
                maxZoom: 18,
                minZoom: 2
            }),
            gaode_imga = this._chinaProvider('GaoDe.Satellite.Annotion', {
                maxZoom: 18,
                minZoom: 2
            });
        var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            minZoom: 2
        });
        var googleNormalMap = this._chinaProvider('Google.Normal.Map', {
                maxZoom: 18,
                minZoom: 2
            }),
            googleSatelliteMap = this._chinaProvider('Google.Satellite.Map', {
                maxZoom: 18,
                minZoom: 2
            });
        var tdt_normalm = this._chinaProvider('TianDiTu.Normal.Map', {
                maxZoom: 18,
                minZoom: 2
            }),
            tdt_normala = this._chinaProvider('TianDiTu.Normal.Annotion', {
                maxZoom: 18,
                minZoom: 2
            }),
            tdt_imgm = this._chinaProvider('TianDiTu.Satellite.Map', {
                maxZoom: 18,
                minZoom: 2
            }),
            tdt_imga = this._chinaProvider('TianDiTu.Satellite.Annotion', {
                maxZoom: 18,
                minZoom: 2
            });
        return [
            {label: '地图', id: 'b1', layer: normalm1},
            //{label: '多彩', id: 'b2', layer: normalm2},
            {label: '午夜蓝', id: 'b3', layer: normalm3},
            {label: '灰色', id: 'b4', show: true, layer: normalm4},
            {label: '高德地图', id: 'gaode', layer: gaode},
            {label: '高德影像', id: 'gaode_img', layer: L.layerGroup([gaode_imgm, gaode_imga])},
            {label: '谷歌地图', id: 'google', layer: googleNormalMap},
            {label: '谷歌影像', id: 'google_img', layer: googleSatelliteMap},
            {label: '天地图', id: 'tdt', layer: L.layerGroup([tdt_normalm, tdt_normala])},
            {label: '天地图影像', id: 'tdt_img', layer: L.layerGroup([tdt_imgm, tdt_imga])},
            //{label: '暖色', id: 'b5', layer: normalm5},
            //{label: '冷色', id: 'b6', layer: normalm6},
            {label: 'OSM', id: 'osm', layer: osm}
        ];
    },
    _chinaProvider: function (type, options) {
        options = options || {};
        var providers = {
            TianDiTu: {
                Normal: {
                    Map: "http://t{s}.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}",
                    Annotion: "http://t{s}.tianditu.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}"
                },
                Satellite: {
                    Map: "http://t{s}.tianditu.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}",
                    Annotion: "http://t{s}.tianditu.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}"
                },
                Terrain: {
                    Map: "http://t{s}.tianditu.cn/DataServer?T=ter_w&X={x}&Y={y}&L={z}",
                    Annotion: "http://t{s}.tianditu.cn/DataServer?T=cta_w&X={x}&Y={y}&L={z}"
                },
                Subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
            },

            GaoDe: {
                Normal: {
                    Map: 'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
                },
                Satellite: {
                    Map: 'http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
                    Annotion: 'http://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
                },
                Subdomains: ["1", "2", "3", "4"]
            },

            Google: {
                Normal: {
                    Map: "http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
                },
                Satellite: {
                    Map: "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
                },
                Subdomains: []
            },

            Geoq: {
                Normal: {
                    Map: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",
                    Color: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetColor/MapServer/tile/{z}/{y}/{x}",
                    PurplishBlue: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
                    Gray: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}",
                    Warm: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}",
                    Cold: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetCold/MapServer/tile/{z}/{y}/{x}"
                },
                Subdomains: []

            }
        };
        var parts = type.split('.');

        var providerName = parts[0];
        var mapName = parts[1];
        var mapType = parts[2];

        var url = providers[providerName][mapName][mapType];
        options['subdomains'] = providers[providerName].Subdomains;
        options['className'] = 'basemap';
        return L.tileLayer(url, options);
    },

    //Measurement
    _toggleMeasure: function (e) {
        this._measuring = !this._measuring;

        if (this._measuring) {
            L.DomUtil.addClass(this._container, 'leaflet-control-measure-on');
            this._startMeasuring();

            this._measureBtn = e.target;
            if (this._measureBtn)this._measureBtn.className = this._measureBtn.className + ' selected';
        } else {
            //L.DomUtil.removeClass(this._container, 'leaflet-control-measure-on');
            //this._stopMeasuring();

            if (this._layerPaint) {
                this._layerPaint.clearLayers();
            }
            this._finishPath();
        }
    },
    _startMeasuring: function () {
        this._oldCursor = this._map._container.style.cursor;
        this._map._container.style.cursor = 'crosshair';

        this._doubleClickZoom = this._map.doubleClickZoom.enabled();
        this._map.doubleClickZoom.disable();

        L.DomEvent
            .on(this._map, 'mousemove', this._mouseMove, this)
            .on(this._map, 'click', this._mouseClick, this)
            .on(this._map, 'dblclick', this._mouseDBClick, this)
            .on(document, 'keydown', this._onKeyDown, this);

        //if (!this._layerPaint) {
        //    this._layerPaint = L.layerGroup().addTo(this._map);
        //}
        this._layerPaint = L.layerGroup().addTo(this._map);

        if (!this._points) {
            this._points = [];
        }
    },
    _stopMeasuring: function () {
        this._map._container.style.cursor = this._oldCursor;

        L.DomEvent
            .off(document, 'keydown', this._onKeyDown, this)
            .off(this._map, 'mousemove', this._mouseMove, this)
            .off(this._map, 'click', this._mouseClick, this)
            .off(this._map, 'dblclick', this._mouseDBClick, this);

        if (this._doubleClickZoom) {
            this._map.doubleClickZoom.enable();
        }

        //if (this._layerPaint) {
        //    this._layerPaint.clearLayers();
        //}

        this._restartPath();
    },
    _mouseMove: function (e) {
        if (!e.latlng || !this._lastPoint) {
            return;
        }

        if (!this._layerPaintPathTemp) {
            this._layerPaintPathTemp = L.polyline([this._lastPoint, e.latlng], {
                color: 'black',
                weight: 1.5,
                clickable: false,
                dashArray: '6,3'
            }).addTo(this._layerPaint);
        } else {
            //this._layerPaintPathTemp.spliceLatLngs(0, 2, this._lastPoint, e.latlng);
            this._layerPaintPathTemp.setLatLngs([this._lastPoint, e.latlng]);
        }

        if (this._tooltip) {
            if (!this._distance) {
                this._distance = 0;
            }

            this._updateTooltipPosition(e.latlng);

            var distance = e.latlng.distanceTo(this._lastPoint);
            this._updateTooltipDistance(this._distance + distance, distance);
        }
    },
    _timeID: null,
    _mouseClick: function (e) {
        if (this._timeID)return;
        var self = this;
        // Skip if no coordinates
        if (!e.latlng) {
            return;
        }

        // If we have a tooltip, update the distance and create a new tooltip, leaving the old one exactly where it is (i.e. where the user has clicked)
        if (this._lastPoint && this._tooltip) {
            if (!this._distance) {
                this._distance = 0;
            }

            this._updateTooltipPosition(e.latlng);

            var distance = e.latlng.distanceTo(this._lastPoint);
            this._updateTooltipDistance(this._distance + distance, distance);

            this._distance += distance;
        }
        else {
            this._startPointTooltip(e.latlng);
        }
        this._createTooltip(e.latlng);

        // If this is already the second click, add the location to the fix path (create one first if we don't have one)
        if (this._lastPoint && !this._layerPaintPath) {
            this._layerPaintPath = L.polyline([this._lastPoint], {
                color: 'black',
                weight: 2,
                clickable: false
            }).addTo(this._layerPaint);
        }

        if (this._layerPaintPath) {
            this._layerPaintPath.addLatLng(e.latlng);
        }

        // Upate the end marker to the current location
        //if (this._lastCircle) {
        //    this._layerPaint.removeLayer(this._lastCircle);
        //}

        if (this._lastCircle) {
            this._lastCircle.bringToFront();
            this._lastCircle = new L.CircleMarker(e.latlng, {
                color: 'black',
                fillColor: '#fff',
                opacity: 1,
                weight: 1,
                fill: true,
                fillOpacity: 1,
                radius: 3,
                clickable: this._lastCircle ? true : false
            }).addTo(this._layerPaint);
        }
        else {
            //首个点使用绿色填充
            this._lastCircle = new L.CircleMarker(e.latlng, {
                color: 'black',
                fillColor: '#00FF00',
                opacity: 1,
                weight: 1,
                fill: true,
                fillOpacity: 1,
                radius: 3,
                clickable: this._lastCircle ? true : false
            }).addTo(this._layerPaint);
        }

        //this._lastCircle.on('click', function (ev) {
        //    L.DomEvent.stopPropagation(ev);
        //
        //    this._finishPath();
        //    this._lastPointTooltip(ev.latlng);
        //}, this);

        // Save current location as last location
        this._lastPoint = e.latlng;

        this._timeID = setTimeout(function () {
            clearTimeout(this._timeID);
            self._timeID = null;
        }, 300);
    },
    _mouseDBClick: function (e) {
        if (this._timeID) {
            clearTimeout(this._timeID);
            this._timeID = null;
        }
        L.DomEvent.stopPropagation(e);

        this._finishPath();
        this._lastPointTooltip(e.latlng);
    },
    _finishPath: function () {
        // Remove the last end marker as well as the last (moving tooltip)
        if (this._lastCircle) {
            this._layerPaint.removeLayer(this._lastCircle);
        }
        if (this._tooltip) {
            this._layerPaint.removeLayer(this._tooltip);
        }
        if (this._layerPaint && this._layerPaintPathTemp) {
            this._layerPaint.removeLayer(this._layerPaintPathTemp);
        }

        // Reset everything
        //this._restartPath();

        this._measuring = false;
        L.DomUtil.removeClass(this._container, 'leaflet-control-measure-on');
        this._stopMeasuring();
        if (this._measureBtn)this._measureBtn.className = this._measureBtn.className.replace(' selected', '');
    },
    _restartPath: function () {
        this._distance = 0;
        this._tooltip = undefined;
        this._lastCircle = undefined;
        this._lastPoint = undefined;
        this._layerPaintPath = undefined;
        this._layerPaintPathTemp = undefined;
    },
    _createTooltip: function (position) {
        var icon = L.divIcon({
            className: 'leaflet-measure-tooltip',
            iconAnchor: [-5, -5]
        });
        this._tooltip = L.marker(position, {
            icon: icon,
            clickable: false
        }).addTo(this._layerPaint);
    },
    _updateTooltipPosition: function (position) {
        this._tooltip.setLatLng(position);
    },
    _updateTooltipDistance: function (total, difference) {
        var totalRound = this._round(total),
            differenceRound = this._round(difference);
        //该计算结果为海里单位,转换成公里 1nm=1.8532km
        totalRound = Math.round(totalRound * 1.8532 * 100000) / 100000;
        differenceRound = Math.round(differenceRound * 1.8532 * 100000) / 100000;
        var text = '<div class="leaflet-measure-tooltip-total">' + totalRound + ' km</div>';
        if (differenceRound > 0 && totalRound != differenceRound) {
            text += '<div class="leaflet-measure-tooltip-difference">(+' + differenceRound + ' km)</div>';
        }
        //var text = '<div class="leaflet-measure-tooltip-total">' + totalRound + ' nm</div>';
        //if (differenceRound > 0 && totalRound != differenceRound) {
        //    text += '<div class="leaflet-measure-tooltip-difference">(+' + differenceRound + ' nm)</div>';
        //}

        this._tooltip._icon.innerHTML = text;
    },
    _startPointTooltip: function (position) {
        var icon = L.divIcon({
            className: 'leaflet-measure-tooltip',
            iconAnchor: [-5, -5]
        });
        this._tooltip = L.marker(position, {
            icon: icon,
            clickable: false
        }).addTo(this._layerPaint);
        this._tooltip._icon.innerHTML = '起点';
    },
    _lastPointTooltip: function (position) {
        var iconP, layers = this._layerPaint.getLayers();
        for (var i = 0, len = layers.length; i < len; i++) {
            if ('_icon' in layers[i]) {
                iconP = layers[i]
            }
        }
        if (iconP) {
            iconP._icon.innerHTML = '<div>终点<button class="measure-close"><i class="icon icon-remove"></i></button></div>' + iconP._icon.innerHTML;
            var target_map = this._map, target_layer = this._layerPaint;
            iconP._icon.getElementsByClassName('measure-close')[0].onclick = function () {
                target_map.removeLayer(target_layer);
            };
        }

        //最后一个点使用红色填充
        new L.CircleMarker(position, {
            color: 'black',
            fillColor: 'red',
            opacity: 1,
            weight: 1,
            fill: true,
            fillOpacity: 1,
            radius: 3,
            clickable: this._lastCircle ? true : false
        }).addTo(this._layerPaint);

        //this._tooltip._icon.innerHTML = '<div>终点<button class="measure-close"><i class="icon icon-remove"></i></button></div>' + this._tooltip._icon.innerHTML;
    },
    _round: function (val) {
        return Math.round((val / 1852) * 10) / 10;
    },
    _onKeyDown: function (e) {
        if (e.keyCode == 27) {
            // If not in path exit measuring mode, else just finish path
            //if (!this._lastPoint) {
            //    this._toggleMeasure();
            //} else {
            //    this._finishPath();
            //}
            if (this._layerPaint) {
                this._layerPaint.clearLayers();
            }
            this._finishPath();
        }
    },

    //LayerOrder
    _zIndexBase: 1,
    _layerSelected: false,
    _handlingLayerVisible: false,
    _updateLayerList: function () {
        if (!this._container) {
            return;
        }

        this._layerListContainer.innerHTML = '';

        //var self = this, i = 1;
        for (var lyr in this._listLayers) {
            var obj = this._listLayers[lyr];
            if (obj) {
                //obj.layer.options['zIndex'] = i;
                //i++;
                this._addLayerListItem(obj);
            }
        }
    },

    // add controled layer
    _addLayerListItem: function (obj) {
        var row = document.createElement('div'),
            label = document.createElement('label'),
            input = document.createElement('input'),
        //downicon = document.createElement('div'),
        //upicon = document.createElement('div'),

            layer = obj.layer,
            layerAttr = obj.name,
            layerId = obj.id;

        row.style.width = '100%';
        row.style.height = '26px';
        row.className = 'layerlist-row';
        row.setAttribute("tag", "layerlist");
        row.layerId = layerId;

        input.className = 'input-blue';
        input.setAttribute("id", "ll-" + layerId);
        input.setAttribute("name", "ll-group");
        input.setAttribute("checked", "checked");
        input.setAttribute("value", layerId);
        input.layerId = layerId;
        input.type = 'checkbox';

        L.DomEvent.on(input, 'click', this._onInputClick, this);
        row.appendChild(input);

        label.setAttribute("for", "ll-" + layerId);
        label.setAttribute("tag", "layerlist");
        label.className = 'vertical layerlist-label';
        label.innerHTML = layerAttr;
        row.appendChild(label);

        this._layerListContainer.appendChild(row);
    },
    _updateLayers: function (layers) {
        if (!this._listLayers) {
            this._listLayers = {};
        }
        for (var i = 0, len = layers.length; i < len; i++) {
            var layerObj = layers[i];
            if (layerObj.options && ('name' in layerObj.options)) {
                this._listLayers[layerObj.options.layerId] = {
                    layer: layerObj,
                    name: layerObj.options.name,
                    id: layerObj.options.layerId,
                    type: layerObj.options.type,
                    overlay: true
                };
                if (layerObj.setZIndex) {
                    layerObj.setZIndex(this._zIndexBase);
                }
            }
        }
        this._updateLayerList();
    },
    _onInputClick: function (e) {
        L.DomEvent.stopPropagation(e);

        var target = e.currentTarget;
        var input, obj,
            inputs = this._layerListContainer.getElementsByTagName('input'),
            inputsLen = inputs.length;

        this._handlingLayerVisible = true;
        //
        for (var i = 0; i < inputsLen; i++) {
            input = inputs[i];
            obj = this._listLayers[input.layerId];
            if (input.type === 'checkbox' || input.type === "radio") {
                if (input.checked && !this._map.hasLayer(obj.layer)) {
                    this._map.addLayer(obj.layer);

                } else if (!input.checked && this._map.hasLayer(obj.layer)) {
                    this._map.removeLayer(obj.layer);
                }
            }
        }
        //
        this._handlingLayerVisible = false;
    },

    // select
    _selectActive: false,
    _createSelectPanel: function (container) {
        container.innerHTML = "";
        var _this = this, stop = L.DomEvent.stopPropagation,
            s_rect_btn = L.DomUtil.create('button', 'button blue', container),
            optionStr = '';

        s_rect_btn.innerHTML = '<i class="icon icon-square-o" style="margin-right: 3px"></i>框择';
        L.DomEvent
            .on(s_rect_btn, 'click', stop)
            .on(s_rect_btn, 'dblclick', stop)
            .on(s_rect_btn, 'click', function () {
                if (!_this._selectActive) {
                    document.getElementById('tool-select-layer').disabled = _this._selectActive = true;
                    document.getElementById('tool-select-layer-div').className += ' disabled';
                    _this._setSelectStateOn();
                }
                else {
                    document.getElementById('tool-select-layer').disabled = _this._selectActive = false;
                    document.getElementById('tool-select-layer-div').className = document.getElementById('tool-select-layer-div').className.replace(' disabled', '');
                    _this._finishSelect();
                    _this._setSelectStateOff();
                }
            });

        var hsep = document.createElement('div'), layerSelect = document.createElement('div');
        hsep.className = 'hsep-h';

        for (var lyr in this._listLayers) {
            var obj = this._listLayers[lyr];
            if (obj && obj.type === 'vector') {
                optionStr += "<option value='" + obj.id + "'>" + obj.name + "</option>";
            }
        }
        layerSelect.innerHTML = "图层：<div id='tool-select-layer-div' ><select id='tool-select-layer'>" + optionStr + "</select></div>";
        container.appendChild(hsep);
        container.appendChild(layerSelect);
    },
    _setSelectStateOn: function () {
        this._map.dragging.disable();
        L.DomEvent.on(this._map._container, 'mousedown', this._onMouseDown, this);
        L.DomUtil.addClass(this._map._container, 'leaflet-crosshair');
    },
    _setSelectStateOff: function () {
        this._map.dragging.enable();
        L.DomEvent.off(this._map._container, 'mousedown', this._onMouseDown, this);
        L.DomUtil.removeClass(this._map._container, 'leaflet-crosshair');
    },
    _resetSelectState: function () {
        this._moved = false;
    },
    _onMouseDown: function (e) {
        this._resetSelectState();

        L.DomUtil.disableTextSelection();
        L.DomUtil.disableImageDrag();

        this._startPointSelect = this._map.mouseEventToContainerPoint(e);

        L.DomEvent.on(document, {
            contextmenu: L.DomEvent.stop,
            mousemove: this._onMouseMove,
            mouseup: this._onMouseUp,
            keydown: this._onSelectKeyDown
        }, this);
    },
    _onMouseMove: function (e) {
        if (!this._moved) {
            this._moved = true;

            this._box = L.DomUtil.create('div', 'leaflet-zoom-box-select', this._map._container);
        }

        this._pointSelect = this._map.mouseEventToContainerPoint(e);

        var bounds = new L.Bounds(this._pointSelect, this._startPointSelect),
            size = bounds.getSize();

        L.DomUtil.setPosition(this._box, bounds.min);

        this._box.style.width = size.x + 'px';
        this._box.style.height = size.y + 'px';
    },
    _onMouseUp: function (e) {
        this._finishSelect();
        //this._setSelectStateOff();

        if (!this._moved) {
            return;
        }
        // Postpone to next JS tick so internal click event handling
        // still see it as "moved".
        setTimeout(L.bind(this._resetSelectState, this), 0);
        var map = this._map,
            bounds = new L.LatLngBounds(
                this._map.containerPointToLatLng(this._startPointSelect),
                this._map.containerPointToLatLng(this._pointSelect));

        //this._map
        //    .fitBounds(bounds)
        //    .fire('boxzoomend', {boxZoomBounds: bounds});
        var selectObj = document.getElementById('tool-select-layer'),
            layerid = selectObj.options[selectObj.selectedIndex].value,
            features = [];
        //intersects(<Bounds> otherBounds)
        //contains(<Bounds> otherBounds) contains(<Point> point)
        this._listLayers[layerid].layer.eachLayer(function (layer) {
            if (layer.hasOwnProperty("feature")) {
                if (!layer.hasOwnProperty("originColor")) {
                    layer.originColor = layer.options.color;
                }

                if (layer.feature.geometry.type === 'Point') {
                    //layer.setStyle({
                    //    color: bounds.contains(layer.getLatLng()) ? '#0f0' : layer.originColor
                    //});
                    if (bounds.contains(layer.getLatLng())) {
                        layer.setStyle({
                            color: '#0f0'
                        });
                        features.push(layer.feature);
                    }
                    else {
                        layer.setStyle({
                            color: layer.originColor
                        });
                    }
                }
                else if(layer.feature.geometry.type === 'Polygon'){
                    var points = layer.getLatLngs();
                    for (var i = 0, leni = points.length; i < leni; i++) {
                        for (var j = 0, lenj = points[i].length; j < lenj; j++) {
                            if (bounds.contains(points[i][j])) {
                                layer.setStyle({
                                    color: '#0f0'
                                });
                                features.push(layer.feature);
                                return;
                            }
                        }
                    }
                    layer.setStyle({
                        color: layer.originColor
                    });
                }
                else if(layer.feature.geometry.type === 'LineString'){
                    var points = layer.getLatLngs();
                    for (var i = 0, len = points.length; i < len; i++) {
                        if (bounds.contains(points[i])) {
                            layer.setStyle({
                                color: '#0f0'
                            });
                            features.push(layer.feature);
                            return;
                        }
                    }
                    layer.setStyle({
                        color: layer.originColor
                    });
                }
                else {
                    var points = layer.getLatLngs();
                    for (var i = 0, len = points.length; i < len; i++) {
                        if (bounds.contains(points[i])) {
                            layer.setStyle({
                                color: '#0f0'
                            });
                            features.push(layer.feature);
                            return;
                        }
                    }
                    layer.setStyle({
                        color: layer.originColor
                    });
                }
            }
        });
        if(this.options.onSelected && typeof this.options.onSelected === 'function'){
            this.options.onSelected(features);
        }
    },
    _finishSelect: function () {
        if (this._moved) {
            L.DomUtil.remove(this._box);
        }

        L.DomUtil.enableTextSelection();
        L.DomUtil.enableImageDrag();

        L.DomEvent.off(document, {
            contextmenu: L.DomEvent.stop,
            mousemove: this._onMouseMove,
            mouseup: this._onMouseUp,
            keydown: this._onSelectKeyDown
        }, this);
    },
    _onSelectKeyDown: function (e) {
        if (e.keyCode === 27) {
            this._finishSelect();
            this._setSelectStateOff();
        }
    },

    //Print
    _print: function (e) {
        //if (this.options.elementsToHide){
        //    var htmlElementsToHide = document.querySelectorAll(this.options.elementsToHide);
        //
        //    for (var i = 0; i < htmlElementsToHide.length; i++) {
        //        htmlElementsToHide[i].className = htmlElementsToHide[i].className + ' _epHidden';
        //    }
        //}
        //this._map.fire("beforePrint");
        //window.print();
        //this._map.fire("afterPrint");
        //if (this.options.elementsToHide){
        //    var htmlElementsToHide = document.querySelectorAll(this.options.elementsToHide);
        //    for (var i = 0; i < htmlElementsToHide.length; i++) {
        //        htmlElementsToHide[i].className = htmlElementsToHide[i].className.replace(' _epHidden','');
        //    }
        //}

        function findChild(node, childs, exclude) {
            if (node.children.length != 0) {
                var childrenNodes = node.children;
                for (var index = 0; index < childrenNodes.length; index++) {
                    if (exclude) {
                        var has = false;
                        for (var i = 0, len = exclude.length; i < len; i++) {
                            if (childrenNodes[index].className.indexOf(exclude[i]) !== -1) {
                                has = true;
                                break;
                            }
                        }
                        console.log(childrenNodes[index].className);
                        if (!has)
                            childs.push(childrenNodes[index]);
                    }
                    else {
                        childs.push(childrenNodes[index]);
                    }

                    findChild(childrenNodes[index], childs, exclude);
                }
            }
        }

        var doms = document.all,
            mapDom = this._map._container,
            mapDoms = [],
            theChild = mapDom,
            elementsToHideClasses = ['map-tools-container', 'leaflet-control-zoom'];
        while (theChild.parentNode != null) {
            theChild = theChild.parentNode;
            mapDoms.push(theChild);
        }
        findChild(mapDom, mapDoms, elementsToHideClasses);
        for (var i = 0, len = doms.length; i < len; i++) {
            if (mapDoms.indexOf(doms[i]) === -1) {
                doms[i].className = doms[i].className + ' _epHidden';
            }
        }
        var oTitle = document.title;
        document.title = "Layout Map";
        this._map.fire("beforePrint");
        window.print();
        this._map.fire("afterPrint");
        document.title = oTitle;
        for (var i = 0, len = doms.length; i < len; i++) {
            doms[i].className = doms[i].className.replace(' _epHidden', '');
        }
    }
});

L.mapTools = function (option) {
    return new L.MapTools(option);
};