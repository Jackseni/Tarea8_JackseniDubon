import React, {Component} from 'react'

import styles from './ToastComponent.scss';



class ToastComponent extends Component{
    constructor(props){
        super(props);
       
    }


    render(){
        return(            
            <div role="alert" aria-live="assertive" aria-atomic="true" className={"toast "+styles.toast} data-autohide="true">
            <div className="toast-body">
                Color en hexadecimal copiado al portapapeles
            </div>
            </div>            
        )
    }
}

export default ToastComponent;