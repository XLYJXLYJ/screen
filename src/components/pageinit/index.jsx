import React, { Component } from "react"

import './index.scss'

export default class Pageinit extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (<div className={"pageinit" + (this.props.compare ? " hide":"")}>
            <div className="box">
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjYjRiMmI0Ij4gIDxwYXRoIG9wYWNpdHk9Ii4yNSIgZD0iTTE2IDAgQTE2IDE2IDAgMCAwIDE2IDMyIEExNiAxNiAwIDAgMCAxNiAwIE0xNiA0IEExMiAxMiAwIDAgMSAxNiAyOCBBMTIgMTIgMCAwIDEgMTYgNCIvPiAgPHBhdGggZD0iTTE2IDAgQTE2IDE2IDAgMCAxIDMyIDE2IEwyOCAxNiBBMTIgMTIgMCAwIDAgMTYgNHoiPiAgICA8YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgZnJvbT0iMCAxNiAxNiIgdG89IjM2MCAxNiAxNiIgZHVyPSIwLjhzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgLz4gIDwvcGF0aD48L3N2Zz4=" alt=""/>
            </div>
        </div>)
    }
}

Pageinit.defaultProps = {
    compare: true,
}
