import * as React from "react";
import {Link} from "react-router-dom";

export class TopNavBar extends React.Component<ITopNavBar, ITopNavBar> {
    render() {
        return <div className="topnav">
            {this.props.items.map((item: ITopNavBarItem, index: number) =>
                <TopNavBarItem key={index} tabName={item.tabName} tabLink={item.tabLink}
                               active={this.props.activeItemIndex == index}/>
            )}
        </div>
    }
}

interface ITopNavBarItem {
    tabName: string;
    tabLink: string;
    active: boolean;
}

export interface ITopNavBar {
    items: Array<ITopNavBarItem>;
    activeItemIndex: number;
}

function TopNavBarItem(props: ITopNavBarItem) {
    return <Link to={`/${props.tabLink}`} className={props.active ? "active" : ""}>{props.tabName}</Link>
}
