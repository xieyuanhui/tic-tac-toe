import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/**
 * 棋盘单元格，每个单元格是一个按钮
 *
 * @param props
 * @constructor
 */
function Square(props) {
    return (
        <button className={props.selected ? "winSquare" : "square"} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

/**
 * 棋盘，由九个单元格组成
 */
class Board extends React.Component {
    /**
     * 渲染单元格
     *
     * @param i 单元格序号
     */
    renderSquare(i) {
        const winnerId = this.props.winnerId;
        let selected = false;
        if (winnerId && winnerId.indexOf(i) > -1) {
            selected = true;
        }
        return <Square key={i} selected={selected}
                       value={this.props.squares[i]}
                       onClick={() => this.props.onClick(i)}/>;
    }

    /**
     * 渲染页面
     */
    render() {
        let grids = [];
        const rows = 3;
        const columns = 3;
        for (let i = 0; i < rows; i++) {
            let items = [];
            for (let j = 0; j < columns; j++) {
                items.push(this.renderSquare(i * 3 + j));
            }
            grids.push(<div key={i} className={"board-row"}>{items}</div>);
        }
        return (
            <div>
                {grids}
            </div>
        );
    }
}

/**
 * 整个游戏界面
 */
class Game extends React.Component {
    /**
     * 构造函数
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                serialNum: 0,
                squares: Array(9).fill(null),
                coordinate: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            order: null,
        }
    }

    /**
     * 点击单元格处理
     *
     * @param i
     */
    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        const coordinate = '(' + Math.floor(i / 3) + ',' + i % 3 + ')'
        this.setState({
            history: history.concat([{
                serialNum: this.state.stepNumber + 1,
                squares: squares,
                coordinate: coordinate,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    /**
     * 点击历史记录跳转
     *
     * @param step
     */
    jumpTo(step) {
        // 清除所有样式
        for (let i = 0; i < this.state.history.length; i++) {
            const tempId = 'button' + i;
            document.getElementById(tempId).style.fontWeight = '';
        }
        // 加粗点击的按钮字体
        const id = 'button' + step;
        document.getElementById(id).style.fontWeight = 'bold';
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        })
    }

    /**
     * 转换历史记录排列顺序
     */
    changeOrder() {
        const order = this.state.order;
        this.setState({
            order: order === 'asc' ? 'desc' : 'asc',
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winnerId = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            if (this.state.order === 'asc') {
                move = this.state.history.length - move - 1;
            }
            let desc = move ? 'Go to move #' + move + ',coordinate is ' + history[move].coordinate : 'Go to start';
            return (
                <li key={move}>
                    <button id={"button" + move} onClick={() => {
                        this.jumpTo(move)
                    }}>{desc}</button>
                </li>
            )
        })

        let status;
        if (winnerId) {
            status = 'Winner: ' + current.squares[winnerId[0]];
        } else if (current.serialNum >= 9) {
            status = 'No winner';
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares} winnerId={winnerId}
                           onClick={(i) => this.handleClick(i)}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>
                        <button onClick={() => this.changeOrder()}>
                            {this.state.order === 'asc' ? '降序排列' : '升序排列'}
                        </button>
                    </div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

/**
 * 判断游戏胜者
 *
 * @param squares
 * @returns {null|number[]}
 */
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return [a, b, c];
        }
    }
    return null;
}