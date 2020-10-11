import * as React from "react";
import {TopNavBar, ITopNavBar} from "./TopNavBar";
import {NeuralStyleTransfer} from "./NeuralStyleTransfer";
import {FutureStuff} from "./FutureStuff";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

const NEURAL_STYLE_TRANSFER_NAME = "Neural Style Transfer";
const NEURAL_STYLE_TRANSFER_LINK = "Neural_Style_Transfer";
const FUTURE_STUFF_NAME = "Future Stuff";
const FUTURE_STUFF_LINK = "Future_Stuff";

const topNavBarItems: ITopNavBar = {
    items: [
        {tabName: NEURAL_STYLE_TRANSFER_NAME, tabLink: NEURAL_STYLE_TRANSFER_LINK, active: false},
        {tabName: FUTURE_STUFF_NAME, tabLink: FUTURE_STUFF_LINK, active: false}
    ],
    activeItemIndex: -1
};

// TODO add ts linter
export class App extends React.Component<IProps, IProps> {
    constructor(props: IProps) {
        super(props);
        this.state = {name: props.name};
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route path={"/"} exact
                           render={() => {
                               return (<React.Fragment>
                                   <TopNavBar items={topNavBarItems.items} activeItemIndex={-1}/>
                                   <div className="main-content"/>
                               </React.Fragment>);
                           }}/>
                    <Route path={`/${NEURAL_STYLE_TRANSFER_LINK}`}
                           render={() => {
                               return (<React.Fragment>
                                   <TopNavBar items={topNavBarItems.items} activeItemIndex={0}/>
                                   <div className="main-content">
                                       <NeuralStyleTransfer/>
                                   </div>
                               </React.Fragment>);
                           }}/>
                    <Route path={`/${FUTURE_STUFF_LINK}`}
                           render={() => {
                               return (<React.Fragment>
                                   <TopNavBar items={topNavBarItems.items} activeItemIndex={1}/>
                                   <div className="main-content">
                                       <FutureStuff/>
                                   </div>
                               </React.Fragment>);
                           }}/>
                </Switch>
            </Router>
        );
    }
}

interface IProps {
    name: string;
}