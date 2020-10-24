import * as React from "react";
import * as tf from '@tensorflow/tfjs';


const CONTENT_INDEX = 0;
const STYLE_INDEX = 1;
const CONTENT_IMAGE_ID = "contentImage";
const STYLE_IMAGE_ID = "styleImage";

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
    stopStyling: boolean = false;

    constructor(props: {}) {
        super(props);
        this.state = {
            images: [
                {source: "", element: undefined},
                {source: "", element: undefined},
            ],
            status: undefined
        };
        this.onImageUpload = this.onImageUpload.bind(this);
    }

    onImageUpload = (ev: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (!ev.target.files) {
            console.error("The event contains no files!");
        } else {
            let imageFile = ev.target.files[0];
            let htmlElement = ev.target;
            // Update the source state.
            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target && typeof ev.target.result == "string") {
                    let oldState = this.state;
                    oldState.images[index].source = ev.target.result;
                    oldState.images[index].element = htmlElement;
                    this.setState(oldState);
                }
            };
            fileReader.readAsDataURL(imageFile);
        }
    }


    render(): React.ReactNode {
        return (
            <React.Fragment>
                {/* NOTE: When an invalid index of an array is requested it automatically returns the requested value undefined. */}
                <ImageInput name="original" label="Select the content image:"
                            callbackFunction={(ev: React.ChangeEvent<HTMLInputElement>) => {
                                this.onImageUpload(ev, CONTENT_INDEX)
                            }}/>
                <ImageInput name="style" label="Select the style image:"
                            callbackFunction={(ev: React.ChangeEvent<HTMLInputElement>) => {
                                this.onImageUpload(ev, STYLE_INDEX)
                            }}/>
                <br/>
                <img id={CONTENT_IMAGE_ID} alt="" src={this.state.images[CONTENT_INDEX].source}/>
                <img id={STYLE_IMAGE_ID} alt="" src={this.state.images[STYLE_INDEX].source}/>
                <br/>
                <button onClick={() => {
                    styleImage(this);
                }}>Stylize
                </button>
                <button onClick={() => {
                    this.stopStyling = true;
                }}>Stop Styling
                </button>
                <br/>
                {this.state.status && <h2>{this.state.status}</h2>}
                <br/>
                <canvas id="output"/>
            </React.Fragment>);
    }
}

function setFormStatusMessage(form: NeuralStyleTransferForm, message: string) {
    form.setState({
        images: form.state.images,
        status: message
    });
}

const styleImage = async (form: NeuralStyleTransferForm) => {
    form.stopStyling = false;
    // Assert images are present.
    const contentImageElement = document.getElementById(CONTENT_IMAGE_ID) as HTMLImageElement;
    const styleImageElement = document.getElementById(STYLE_IMAGE_ID) as HTMLImageElement;
    if (!contentImageElement.complete || contentImageElement.naturalWidth == 0) {
        setFormStatusMessage(form, "Looks like you did not select a content image.");
        return;
    }
    if (!styleImageElement.complete || styleImageElement.naturalWidth == 0) {
        setFormStatusMessage(form, "Looks like you did not select a style image.");
        return;
    }
    const contentImage = tf.tidy(() => preprocessInput(tf.browser.fromPixels(contentImageElement).toFloat()));
    const styleImage = tf.tidy(() => preprocessInput(tf.browser.fromPixels(styleImageElement).toFloat()));
    // Assert image have the same dimension.
    if (!contentImage.shape.every((v, i) => v == styleImage.shape[i])) {
        setFormStatusMessage(form, `The content image has a different size ${contentImage.shape} than the style image ${styleImage.shape}`);
        return;
    }

    const contentLayers = ['block5_conv2'];
    const styleLayers = ['block1_conv1',
        'block2_conv1',
        'block3_conv1',
        'block4_conv1',
        'block5_conv1'];

    const extractor = new StyleContentModel();
    await extractor.init(styleLayers, contentLayers);
    const contentTargets = (await extractor.call(contentImage)).content;
    const styleTargets = (await extractor.call(styleImage)).style;
    const targets: StyleAndContentOutput = {content: contentTargets, style: styleTargets};
    const outputImage = tf.variable(contentImage, true);

    //const optimizer = tf.train.adam(0.02, 0.99, 0.1);
    const optimizer = tf.train.adam(0.1, 0.99, 0.1);

    const epochs = 1000;
    const stepPerEpoch = 10;
    for (let epoch = 0; epoch < epochs && !form.stopStyling; epoch++) {
        for (let step = 0; step < stepPerEpoch; step++) {
            tf.tidy(() => {
                optimizer.minimize(() => {
                    const outputs = extractor.call(outputImage);
                    const loss = styleContentLoss(outputs, targets);
                    console.log(`Epoch: ${epoch}, Loss: ${loss.dataSync()}`);
                    return loss.asScalar();
                });
            });
            // Optional: Enable in order to not fry your hardware.
            await sleep(20);
        }
        const postprocessedOutput = tf.tidy(() => {
            return tf.clipByValue(postprocessInput(outputImage).toInt(), 0, 255);
        });
        const canvas = document.getElementById("output") as HTMLCanvasElement;
        await tf.browser.toPixels(postprocessedOutput, canvas);
        postprocessedOutput.dispose();
    }
};

// @ts-ignore
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function styleContentLoss(outputs: StyleAndContentOutput, targets: StyleAndContentOutput): tf.Tensor {
    const styleWeight = 0.01;
    const contentWeight = 10000;
    const styleOutputs = outputs.style;
    const contentOutputs = outputs.content;
    const styleMeans: tf.Tensor[] = [];
    for (let [name, val] of styleOutputs) {
        // TODO tf.squaredDifference()
        const styleDiff = val.sub(targets.style.get(name) as tf.Tensor2D);
        styleMeans.push(tf.mean(styleDiff.mul(styleDiff)));
    }
    const styleLoss = tf.addN(styleMeans).mul(styleWeight / styleMeans.length);

    const contentMeans: tf.Tensor[] = [];
    for (let [name, val] of contentOutputs) {
        const contentDiff = val.sub(targets.content.get(name) as tf.Tensor4D);
        contentMeans.push(tf.mean(contentDiff.mul(contentDiff)));
    }
    const contentLoss = tf.addN(contentMeans).mul(contentWeight / contentMeans.length);
    return styleLoss.add(contentLoss);

}

class StyleContentModel {
    vgg: tf.LayersModel;
    styleLayers: string[];
    contentLayers: string[];
    numStyleLayers: number;

    async init(styleLayers: string[], contentLayers: string[]) {
        this.vgg = await vggLayers(styleLayers.concat(contentLayers));
        this.styleLayers = styleLayers;
        this.contentLayers = contentLayers;
        this.numStyleLayers = styleLayers.length;
        this.vgg.trainable = false;
        this.vgg.summary();
    }

    call(inputs: tf.Tensor4D): StyleAndContentOutput {
        // TODO memory management
        //const scaledInput = inputs;
        //const preprocessedInputs = preprocessInput(scaledInput);
        const outputs = this.vgg.apply(inputs) as tf.Tensor4D[];
        const styleOutputs = outputs.slice(0, this.numStyleLayers);
        const contentOutputs = outputs.slice(this.numStyleLayers, outputs.length);
        const styleDict: Map<string, tf.Tensor2D> = new Map<string, tf.Tensor2D>();
        for (let i = 0; i < styleOutputs.length; i++) {
            styleDict.set(this.styleLayers[i], gramMatrix(styleOutputs[i]));
        }
        const contentMap: Map<string, tf.Tensor4D> = new Map<string, tf.Tensor4D>();
        for (let i = 0; i < contentOutputs.length; i++) {
            contentMap.set(this.contentLayers[i], contentOutputs[i]);
        }
        return {style: styleDict, content: contentMap};
    }
}

interface StyleAndContentOutput {
    style: Map<string, tf.Tensor2D>;
    content: Map<string, tf.Tensor4D>;
}

function preprocessInput(inputs: tf.Tensor3D): tf.Tensor4D {
    return tf.tidy(() => {
        const meanImageNetRGB = [123.68, 116.779, 103.939];
        return inputs.sub(meanImageNetRGB).reverse(2).expandDims();
    });
}

function postprocessInput(input: tf.Tensor4D): tf.Tensor3D {
    return tf.tidy(() => {
        const meanImageNetRGB = [123.68, 116.779, 103.939];
        return input.squeeze().reverse(2).add(meanImageNetRGB);
    });
}

function gramMatrix(inputTensor: tf.Tensor4D): tf.Tensor2D {
    return tf.tidy(() => {
        // TODO caution
        const [, h, w, c] = inputTensor.shape;
        const inputTransposed = tf.transpose(inputTensor, [0, 3, 1, 2]);
        const matrix = tf.reshape(inputTransposed, [c, h * w]);
        return tf.matMul(matrix, matrix, false, true).div(tf.cast(h * w, 'float32')) as tf.Tensor2D;
    });
}

// creates a vgg model that returns a list of intermediate output values.
async function vggLayers(layerNames: string[]): Promise<tf.LayersModel> {
    const vgg = await tf.loadLayersModel('./dl_models/vgg19/model.json');
    vgg.trainable = false;

    /*const outputs = new Array<tf.SymbolicTensor>();
    for (let i = 0; i < layerNames.length; i++) {
        const layerOutput: tf.SymbolicTensor | tf.SymbolicTensor[] = vgg.getLayer(layerNames[i]).output as tf.SymbolicTensor;
        const test = typeof layerOutput
        if (typeof layerOutput == "tf.SymbolicTensor") {
            outputs.push()
        }
    }*/
    const output = layerNames.map(v => vgg.getLayer(v).output as tf.SymbolicTensor);
    return tf.model({inputs: vgg.input, outputs: output})
}

interface INeuralStyleTransferForm {
    images: Array<IImage>;
    status: string | undefined;
}

interface IImage {
    source: string;
    element: HTMLInputElement | undefined;
}

interface IImageInput {
    name: string;
    label: string;
    callbackFunction: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}

function ImageInput(props: IImageInput): React.ReactElement {
    return (<React.Fragment>
            <label htmlFor={props.name}>{props.label}</label>
            <input type="file" id={props.name} name={props.name} accept="image/*" onChange={props.callbackFunction}/>
        </React.Fragment>
    );
}