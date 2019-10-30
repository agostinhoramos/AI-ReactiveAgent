const INCLUDE = {
    URL: function (url, ver, id) {
        if (ver === undefined) { ver = ''; } else { ver = '?v=' + ver; }
        if (id === undefined) { id = ''; }
        var ftype = (url.split('.').pop()).toLowerCase();
        if (ftype == 'css') {
            var l = document.createElement('link');
            l.className = 'include_link';
            l.rel = "stylesheet";
            if (id) { l.id = id }
            l.type = "text/css";
            l.href = url + ver;
            $("body").append(l);
        } else if (ftype == 'js') {
            var s, r, t;
            r = false;
            s = document.createElement('script');
            s.className = 'include_link';
            s.type = 'text/javascript';
            s.src = url + ver;
            if (id) { s.id = id; }
            s.onload = s.onreadystatechange = function () {
                if (!r && (!this.readyState || this.readyState == 'compvare')) { /* READY */ }
            };
            t = document.getElementsByTagName('script')[0];
            t.parentNode.insertBefore(s, t);
        }

    },
    REMOVE: function () {
        $(".include_link").remove();
    }
}

const GEO = {
    N: function (c) {
        return [c[0] - 1, c[1]];
    },
    E: function (c) {
        return [c[0], c[1] + 1];
    },
    S: function (c) {
        return [c[0] + 1, c[1]];
    },
    W: function (c) {
        return [c[0], c[1] - 1];
    },
    NE: function (c) {
        return [c[0] - 1, c[1] + 1];
    },
    SE: function (c) {
        return [c[0] + 1, c[1] + 1];
    },
    SW: function (c) {
        return [c[0] + 1, c[1] - 1];
    },
    NW: function (c) {
        return [c[0] - 1, c[1] - 1];
    },
    LIMIT: {
        N: function (c) {
            return GEO.LIMIT.ROLE(GEO.N(c));
        },
        E: function (c) {
            return GEO.LIMIT.ROLE(GEO.E(c));
        },
        S: function (c) {
            return GEO.LIMIT.ROLE(GEO.S(c));
        },
        W: function (c) {
            return GEO.LIMIT.ROLE(GEO.W(c));
        },
        NE: function (c) {
            return GEO.LIMIT.ROLE(GEO.NE(c));
        },
        SE: function (c) {
            return GEO.LIMIT.ROLE(GEO.SE(c));
        },
        SW: function (c) {
            return GEO.LIMIT.ROLE(GEO.SW(c));
        },
        NW: function (c) {
            return GEO.LIMIT.ROLE(GEO.NW(c));
        },
        ROLE: function (c) {
            if (
                !GEO.LIMIT.HURDLE(c) &&
                !GEO.LIMIT.BORDER(c)
            ) {
                return !1; // is ready!
            }
            return !0;
        },
        BORDER: function (c) {
            var tb = $.panel.warp_disp.find("table");
            var w = tb.find('tr').length;
            var h = tb.find('tr').eq(0).find('td').length;
            if (
                (c[0] <= 0 || c[0] > w) ||
                (c[1] <= 0 || c[1] > h)
            ) {
                return !0;
            }
            return !1;
        },
        HURDLE: function (c) {
            if (GEO.ATTR(c)[0] == 'obstacle') {
                return !0;
            }
            return !1;
        },
        WHERE_GOLD: null,
        GOAL: function (c) {
            if(GEO.ATTR( GEO.N(c) )[0] == 'final'){
                GEO.LIMIT.WHERE_GOLD = 1;
                return !0;
            }else
            if(GEO.ATTR( GEO.E(c) )[0] == 'final'){
                GEO.LIMIT.WHERE_GOLD = 2;
                return !0;
            }else
            if(GEO.ATTR( GEO.S(c) )[0] == 'final'){
                GEO.LIMIT.WHERE_GOLD = 3;
                return !0;
            }else
            if(GEO.ATTR( GEO.W(c) )[0] == 'final'){
                GEO.LIMIT.WHERE_GOLD = 4;
                return !0;
            }
            return !1;
        }
    },
    ATTR: function (c) {
        if( c[0] < 1 || c[1] < 1 ){
            return '';
        }
        var tb = $.panel.warp_disp.find("table");
        var a = [];
        var tmp = null;
        var r = tb.find('tr').eq(c[0] - 1)
            .find('td').eq(c[1] - 1);

        tmp = r.attr('class');
        tmp ? a.push(tmp) : '';
        tmp = r.attr('p');
        tmp ? a.push(tmp) : '';
        return a;
    },
    POS: function (e) {
        var p = e.parent();
        var Y = p.index() + 1;
        var X = 1;
        var d = p[0].cells;
        for(i=0;i<d["length"];i++){
            if( $(d[i]).is(e) ){
                X = i + 1;
            }
        }
        return [Y,X];
    },
    ELEMENT: function (p) {
        var tb = $.panel.warp_disp.find("table");
        return tb.find('tr').eq(p[0] - 1)
            .find('td').eq(p[1] - 1);
    },
    REPEAT: function (arr) {
        var sorted_arr = arr.slice().sort();
        var results = [];
        for (var i = 0; i < sorted_arr.length - 1; i++) {
            if (
                sorted_arr[i + 1][0] == sorted_arr[i][0] &&
                sorted_arr[i + 1][1] == sorted_arr[i][1]
            ) {
                results.push(sorted_arr[i]);
            }
        }
        return results;
    },
    DRAW: function (c) {
        $.panel.warp_disp.find("table td").removeClass('agent');
        GEO.ELEMENT(c).addClass('agent');
    }
}

const fn = {
    scroll: function(e, c, a) {
        if (c === undefined) {
            c = !0;
        }
        if (a === undefined) {
            a = !1;
        }
        var l = $(e)[0].scrollHeight;
        var p = $(e).scrollTop();
        var m_error = 418;
        setTimeout(function() {
            if (a || ((((l - p) - m_error) <= 500) && !a)) {
                if (c) {
                    $(e).scrollTop(l);
                } else {
                    $(e).scrollTop(0);
                }
            }
        }, 100);
    }
};