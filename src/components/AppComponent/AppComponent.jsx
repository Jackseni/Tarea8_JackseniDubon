import React, {Component} from 'react'

import styles from './AppComponent.scss';
import FileSelectorComponent from '../FileSelectorComponent/FileSelectorComponent';
import ImageComponent from '../ImageComponent/ImageComponent';
import LoadingComponent from '../LoadingComponent/LoadingComponent';
import ToastComponent from '../ToastComponent/ToastComponent';



class AppComponent extends Component{
    constructor(props){
        super(props);
        this.state = {
            image: null,
            loading: false           
        }

        this.handleFileOnChange = this.handleFileOnChange.bind(this);
        this.handleOnEndCalculation = this.handleOnEndCalculation.bind(this);
        this.handleOnStartCalculation = this.handleOnStartCalculation.bind(this);
    }

    handleFileOnChange(e){
        let img = new Image();
        if(e.target.files.length === 1){
            img.src = URL.createObjectURL(e.target.files[0]); 
            img.onload = ()=>{
                console.log("Lectura finalizada");
                this.setState({
                    image: img,
                    loading: true 
                });
            };
        }
    }

    handleOnEndCalculation(){
        this.setState({
            loading: false
        });
    }

    handleOnStartCalculation(){
        this.setState({
            loading: true
        });
    }

    render(){
        return(
            <div className={"d-flex flex-column align-items-center "+styles.main}>
            <h1 className={styles.h1}>Generador de paleta de imagénes</h1>
            <ToastComponent />
            <FileSelectorComponent onChange={this.handleFileOnChange}/>
            <LoadingComponent loading = {this.state.loading} />
            <ImageComponent img={this.state.image} loading = {this.state.loading} onStart={this.handleOnStartCalculation} onEnd={this.handleOnEndCalculation}/>
            
           
            </div>
        )
    }
}

export default AppComponent;