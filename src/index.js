import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return <Square key={i} value={this.props.squares[i]} onClick={() => this.props.onClick(i)} />;
    }

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

class Game extends React.Component {
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

    changeOrder() {
        const order = this.state.order;
        let history = this.state.history;
        if (order === 'asc') {
            const compare = (a, b) => {return a.serialNum - b.serialNum;};
            history.sort(compare);
        } else {
            const compareReverse = (a, b) => {return b.serialNum - a.serialNum;};
            history.sort(compareReverse);
        }
        this.setState({
            order: order === 'asc' ? 'desc' : 'asc',
            history: history,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const selectItem = move;
            if (this.state.order === 'asc') {
                move = this.state.history.length - move - 1;
            }
            let desc = move ? 'Go to move #' + move + ',coordinate is ' + step.coordinate : 'Go to start';
            return (
                <li key={selectItem}>
                    <button id={"button" + selectItem} onClick={() => {this.jumpTo(selectItem)}}>{desc}</button>
                </li>
            )
        })

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares}
                           onClick={(i) => this.handleClick(i)}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>
                        <button onClick={() => this.changeOrder()}>{this.state.order === 'asc' ? '降序排列' : '升序排列'}</button>
                    </div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

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
            return squares[a]
        }
    }
    return null;
}