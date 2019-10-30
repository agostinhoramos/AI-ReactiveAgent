window.pl = window.pl || {};
$(document).ready(() => {
    $.panel.warp_disp.append(
        '<div class="controllers">' +
        '<button id="start">Partida</button>' +
        '<button id="obstacle">Obstáculo</button>' +
        '<button id="erase">Apagar</button>' +
        '<button id="sttgs">Definições</button>' +
        '</div>'
    );
    window.$.btn = {
        "start": $("#start"),
        "obstacle": $("#obstacle"),
        "erase": $("#erase"),
        "sttgs": $("#sttgs")
    };

    var ck_size = Cookies.get("tb_size");
    if (ck_size) {
        ck_size = ck_size.split(":");
        output.size(parseInt(ck_size[0]), parseInt(ck_size[1]));
    } else {
        output.size(8, 8);
    }

    $.panel.warp_disp.on("click", function (e) {
        if (!$.agent.is_running) {
            var id = e.target.id;
            if (id.length > 0) {
                $.btn.start.attr('active', null);
                $.btn.obstacle.attr('active', null);
                $.btn.erase.attr('active', null);
                $.btn.sttgs.attr('active', null);
            }
            if (id !== data.select) {
                if (id == $.btn.start[0].id) {
                    $('#' + id).attr('active', !0);
                    data.select = id;
                } else if (id == $.btn.obstacle[0].id) {
                    $('#' + id).attr('active', !0);
                    data.select = id;
                } else if (id == $.btn.erase[0].id) {
                    $('#' + id).attr('active', !0);
                    data.select = id;
                } else if (id == $.btn.sttgs[0].id) {
                    $('#' + id).attr('active', !0);
                    data.select = null;
                }
            } else {
                data.select = null;
            }
            if (data.select !== null) {
                $.panel.warp_disp.attr('on-edit', !0);
            } else {
                $.panel.warp_disp.attr('on-edit', null);
            }
        }
    });
    $.btn.sttgs.on("click", function () {
        if (!$.agent.is_running) {
            alert("Definições",
                '<div class="input-sttgs" ><p>Tamanho da tabela:</p>' +
                '<div class="input-group mb-3" >' +
                '<input id="line" value="' + pl.size[0] + '" placeholder="linha(s)" type="number" class="form-control text-center col mr-2" >' +
                '<input id="colm" value="' + pl.size[1] + '" placeholder="coluna(s)" type="number" class="form-control text-center col" ></div>' +
                '<p>Mostar diferentes combinações:</p>' +
                '<div class="input-group" >' +
                '<input id="rand" type="button" class="btn btn-primary col" value="RANDOM" >' +
                '</div></div>'
            );
            $(".input-sttgs #line").on("change", function () {
                var n = $(this).val();
                if (n > 0 && n < 500) {
                    output.size(n, pl.size[1]);
                }
            });
            $(".input-sttgs #colm").on("change", function () {
                var n = $(this).val();
                if (n > 0 && n < 500) {
                    output.size(pl.size[0], n);
                }
            });
            $(".input-sttgs #rand").on("click", function () {
                pl.cell.empty();
                var x = pl.size[0];
                var y = pl.size[1];
                pl.cell.removeClass('start');
                pl.cell.removeClass('final');
                var rX = Math.floor((Math.random() * x) + 1);
                var rY = Math.floor((Math.random() * y) + 1);
                output.cell([
                    rX,
                    rY
                ], 'start');
                pl.cell.removeClass('obstacle');
                for (v = 0; v < Math.floor((Math.random() * ((x * y) / 2)) + 5); v++) {
                    var tX = Math.floor((Math.random() * x) + 1);
                    var tY = Math.floor((Math.random() * y) + 1);
                    if (rX !== tX && rY !== tY) {
                        output.cell([
                            tX,
                            tY
                        ], 'obstacle');
                    }
                }
                $(".ui-dialog-titlebar-close").click();
                $.btn.sttgs.attr('active', null);
                pl.cell.click();
            });
        }
    });
    pl.cell.click();
});
/* MAIN ALGORITHM */
var MOVE = {
    LAST_DIR: null,
    PATH: [],
    POS: function (c) {
        var POS = null;
        if (
            !GEO.LIMIT.N(c)
        ) {
            POS = GEO.N(c); // N
            this.LAST_DIR = 1;
        } else if (
            !GEO.LIMIT.E(c)
        ) {
            POS = GEO.E(c); // E
            this.LAST_DIR = 2;
        } else if (
            !GEO.LIMIT.S(c)
        ) {
            POS = GEO.S(c); // S
            this.LAST_DIR = 3;
        } else if (
            !GEO.LIMIT.W(c)
        ) {
            POS = GEO.W(c); // O
            this.LAST_DIR = 4;
        } else { // T
            POS = [];
            this.LAST_DIR = 0;
        }
        return POS;
    }
};
GEO.LIMIT.ROLE = function (c) {
    if (
        !GEO.LIMIT.HURDLE(c) &&
        !GEO.LIMIT.BORDER(c) &&
        GEO.ELEMENT(c).html().length < 1
    ) {
        return !1; // next...
    }
    return !0; // stop
};
var Thread = {
    id: null,
    agent: [],
    delay: 200,
    step: 1,
    next: function (callback) {
        var w = pl.table.find('tr').length;
        var h = pl.table.find('tr').eq(0).find('td').length;
        var agent = $('td.start');
        var pos = GEO.POS(agent);
        if (Thread.agent.length > 0) {
            pos = Thread.agent;
        }
        Thread.agent = MOVE.POS(pos);

        callback(pos); // <<<<<<<<<<<<<-------------------

        GEO.DRAW(pos);
        MOVE.PATH.push(pos);
        var repeat = GEO.REPEAT(MOVE.PATH);
        if ( // CONCLUSION
            repeat.length > 3 ||
            MOVE.PATH.length > w * h
        ) {
            if ( // MAX REPEAT ...
                repeat.length > 3
            ) {
                for (i = 0; i < repeat.length; i++) {
                    output.cell(
                        [repeat[i][0], repeat[i][1]],
                        'repeat'
                    );
                }
                MOVE.PATH.pop();
                $.agent.is_running = !0;
            }
        }
        if ( // stop for logic reason..
            !$.input.run.attr('active')
        ) {
            clearInterval(Thread.id);
            $.agent.is_running = !1;
            if ($.agent.have_error) {
                setTimeout(() => {
                    MOVE.PATH = [];
                }, 3500);
            }
        }
    }
};

/* MAIN ALGORITHM */
var auto = {
    run: function () {
        /* define initial variables */
        Thread.step = 1;
        Thread.agent = [];
        MOVE.PATH = [];
        GEO.LIMIT.WHERE_GOLD = null;

        pl.table.find("td.repeat")
            .attr('class', null);
        output.clear();
        pl.final = pl.cell.hasClass('final') ?
            GEO.POS($("td.final")) : [];
        Thread.id = setInterval(() => {
            Thread.next((e) => {
                if (MOVE.LAST_DIR > 0) {
                    output.cell(e,
                        ['P', MOVE.LAST_DIR]
                    );
                    Thread.step++;
                    output.step_role(
                        MOVE.LAST_DIR
                    );
                    output.sensors4([
                        [
                            GEO.LIMIT.N(e) ? 0 : 1,
                            GEO.LIMIT.E(e) ? 0 : 1,
                            GEO.LIMIT.S(e) ? 0 : 1,
                            GEO.LIMIT.W(e) ? 0 : 1
                        ],
                        [
                            e,
                            MOVE.LAST_DIR
                        ]
                    ]);

                } else {
                    clearInterval(Thread.id);
                    setTimeout(() => {
                        output.cell(e, ["NIL"]);
                        output.result.write('<span class="text-secondary" >O agente não sai do lugar, para a navegação.<span>');
                        output.step_role(4);
                        output.sensors4([
                            [0, 0, 0, 0],
                            [e, null]
                        ]);
                        $.input.run.click();
                    }, 100);
                }
            });
        }, Thread.delay);
        output.result.clear();
        pl.cell.removeClass("tmp_yes")
            .removeClass("tmp_no");
        var k = 0,
            i, j;
        for (i = 0; i < pl.tb_arr["length"]; i++) {
            for (j = 0; j < pl.tb_arr[i]["length"]; j++) {
                pl.tb_arr[i][j] = pl.cell[k].className;
                k++;
            }
        }
        Cookies.set('pl.tb_arr', JSON.stringify(pl.tb_arr));
        Cookies.set('tb_size', i + ':' + j);
    }
};

var output = {
    size: function (x, y) {
        var ck = Cookies.get('pl.tb_arr'),
            mrk = null;
        ck !== undefined ? mrk = JSON.parse(ck) : '';
        var tbsz = Cookies.get("tb_size");
        $.panel.warp_disp.find('table').remove();
        var tbhtml = '<table>',
            k = 0;
        pl.tb_arr = [];
        for (i = 0; i < x; i++) {
            pl.tb_arr[i] = [];
            tbhtml += '<tr>';
            for (j = 0; j < y; j++) {
                pl.tb_arr[i][j] = null;
                var clas = (mrk && tbsz == x + ':' + y &&
                    mrk[i][j]) ? ' class="' + mrk[i][j] + '"' : '';
                tbhtml += '<td' + clas + '></td>'; // TODO echo
                k++;
            }
            tbhtml += '</tr>';
        }
        tbhtml += '</table>';
        $.panel.warp_disp.append(tbhtml);
        pl.table = $.panel.warp_disp.find("table");
        pl.cell = pl.table.find("tr td");
        pl.cell.on("click", function () {
            var e = $(this);
            if (data.select != null) {
                if (data.select !== $.btn.erase[0].id) {
                    if (!e.attr('class')) {
                        if (data.select !== $.btn.obstacle[0].id) {
                            pl.cell.removeClass(data.select);
                            e.addClass(data.select);
                        } else {
                            e.addClass(data.select);
                        }
                    }
                } else {
                    e.text('').attr('class', null);
                }
            }
            if (
                pl.cell.hasClass('start')
            ) {
                $.agent.have_error = !1;
                $.input.run.attr('error', null);
            } else {
                $.agent.have_error = !0;
                $.input.run.attr('error', !0);
            }
        });
        pl.size = [x, y];
        $(".demo-step").html('<div class="tb"></div>' +
            '<div class="athm"></div>');

        $('.demo-step .athm').html(
            '<p>1. ¬O1 , ¬P1 → N, Pag</p>' +
            '<p>2. ¬O2 , ¬P2 → E , Pag</p>' +
            '<p>3. ¬O3 , ¬P3 → S , Pag</p>' +
            '<p>4. ¬O4 , ¬P4 → O , Pag</p>' +
            '<p>5. T → NIL (não fazer nada)</p>'
        );

        pl.cell.click();
    },
    cell: function (a, b) {
        var $block = !Array.isArray(a) ? a :
            $('#' + $.panel.warp_disp[0].id + " tr:nth-child(" + a[0] +
                ") td:nth-child(" + a[1] + ")");
        if (!$block.hasClass($.btn.obstacle[0].id)) {
            if (!Array.isArray(b)) {
                $block.addClass(b);
            } else {
                if (b[1] === undefined) {
                    b[1] = '';
                }
                $block.html(b[0] + '<span class="pos" >' +
                    b[1] + '</span>');
            }
        }
    },
    clear: function () {
        pl.table.find("td").empty();
        $(".demo-step .tb").empty();
    },
    result: {
        clear: function () {
            $.panel.warp_resl.empty();
        },
        write: function (d) {
            html = '<div class="show-all-steps mt-2">' +
                '<h4>Observação:</h4>' + d + '</div>';
            $.panel.warp_resl.append(html);
        }
    },
    sensors4: function (d) {
        var p = [0, 3, 1, 2];
        var r = ['N', 'E', 'S', 'O'];
        var tb = '<table onClick="astep(this,' + JSON.stringify(d) + ')" >';
        var k = 0;
        for (i = 0; i < 3; i++) {
            tb += '<tr>';
            for (j = 0; j < 3; j++) {
                if (i == 1 || j == 1) {
                    if (i == 1 && j == 1) {
                        tb += '<td>' + (d[1][0][1]) + ':' + (d[1][0][0]) + '</td>';
                    } else {
                        tb += '<td ' + (d[0][p[k]] ? 'y' : 'n') +
                            '>' + ((d[1][1] == p[k] + 1) ? r[p[k]] : '') + '</td>';
                        k++;
                    }
                } else {
                    tb += '<td x>.</td>';
                }
            }
            tb += '</tr>';
        }
        tb += '</table>';
        $(".demo-step .tb").append(tb);
        fn.scroll($(".demo-step .tb"));
    },
    step_role: function (n) {
        $(".demo-step .athm p").attr('active', null);
        $(".demo-step .athm p").eq(n).attr('active', !0);
    }
};

function astep(e, d) {
    $(e).parent().find('table')
        .attr('active', null);
    $(e).attr('active', !0);
    var a = [d[1][0][0], d[1][0][1]];
    GEO.DRAW(a);

    pl.cell.removeClass('tmp_yes')
        .removeClass('tmp_no');

    output.cell(
        GEO.N(a),
        d[0][0] ? 'tmp_yes' : 'tmp_no'
    );
    output.cell(
        GEO.E(a),
        d[0][1] ? 'tmp_yes' : 'tmp_no'
    );
    output.cell(
        GEO.S(a),
        d[0][2] ? 'tmp_yes' : 'tmp_no'
    );
    output.cell(
        GEO.W(a),
        d[0][3] ? 'tmp_yes' : 'tmp_no'
    );
    output.step_role(d[1][1]);
}