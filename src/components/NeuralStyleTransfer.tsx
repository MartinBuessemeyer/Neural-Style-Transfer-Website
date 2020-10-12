import * as React from "react";

export class NeuralStyleTransfer extends React.Component {
    render(): React.ReactNode {
        return (
            <React.Fragment>
                <h1>Neural Style Transfer</h1>
                <NeuralStyleTransferForm/>
            </React.Fragment>);
    }
}

class NeuralStyleTransferForm extends React.Component<{}, INeuralStyleTransferForm> {
    constructor() {
        super({});
        this.state = {
            images: [
                {source: "", raw: undefined},
                {source: "", raw: undefined},
            ]
        };
    }

    render(): React.ReactNode {
        return (
            <React.Fragment>
                {/* NOTE: When an invalid index of an array is requested it automatically returns the wanted value undefined. */}
                <ImageInput name="original" label="Select the image to augment:"/>
                <ImageInput name="style" label="Select the style image:"/>
                <br/>
                <img id="originalImage" alt="" src={this.state.images[0].source}/>
                <img id="styleImage" alt="" src={this.state.images[1].source}/>
            </React.Fragment>);
    }
}

interface INeuralStyleTransferForm {
    images: Array<IImage>;
}

interface IImage {
    source: string;
    raw: Blob | undefined;
}

interface IImageInput {
    name: string;
    label: string;
}


function ImageInput(props: IImageInput): React.ReactElement {
    return (<React.Fragment>
            <label htmlFor={props.name}>{props.label}</label>
            <input type="file" id={props.name} name={props.name}/>
        </React.Fragment>
    );
}