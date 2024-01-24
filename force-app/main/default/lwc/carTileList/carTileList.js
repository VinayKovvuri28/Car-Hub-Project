import { LightningElement, wire } from 'lwc';
import carhub_logo from '@salesforce/resourceUrl/carhub_logo';
import getCarList from '@salesforce/apex/CarController.getCarList';
//LightningMessageChannel and LightningMessageService
import { publish,subscribe,unsubscribe,MessageContext,APPLICATION_SCOPE } from 'lightning/messageService';
import CARFILTERED from '@salesforce/messageChannel/CarFiltered__c';

export default class CarTileList extends LightningElement {
    placeholder = {
        message :'No cars found',
        img_Url:carhub_logo
    }

    subscription
    cars = []
    error
    filters={};

    /*** Calling wire through wire ***/
    @wire(getCarList, {filters:'$filters'})
    wireGetCarList({data,error}){
        if(data){
            console.log('Car List data:', data);
            this.cars = data
        }
        if(error){
            console.log('error:', error);
            this.error = error
        }
    }

    /*** Load context for LMS ***/
    @wire(MessageContext)
    messageContext

    // Encapsulate logic for Lightning message service subscribe and unsubsubscribe
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                CARFILTERED,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription)
        this.subscription = null
    }

    // Handler for message received by component
    handleMessage(message) {
        console.log('message.filters',message.filters)
        this.filters = {...message.filters}
    }

    // Standard lifecycle hooks used to subscribe and unsubsubscribe to the message channel
    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    /*** handle Car Selection ***/
    handleCarSelected(event){
        publish(this.messageContext, 
            CARFILTERED, {
                carId:event.detail
        })
        console.log('Selected Car Id:', event.detail);
    }

}