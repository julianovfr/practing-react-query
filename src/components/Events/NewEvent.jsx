import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';

import { createNewEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function NewEvent() {
  const navigate = useNavigate();

  //useMutation returns an object
  //mutate diz ao useMutation quando executar o envio da requisicao
  const {mutate, isPending, isError, error} = useMutation({
    queryKey: ['events'],
    mutationFn: createNewEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['events']}); //invalidar a query de eventos
      navigate('/events');} //retorna para a pagina de eventos
      //e vamos invalidar a query de eventos, para que o react query busque os novos eventos
  })
  //MUTATE é para alterar dados
  //QUERY é para buscar dados

  function handleSubmit(formData) {
    mutate({event: formData});
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && <p>Submitting...</p>}
        {!isPending && 
        <>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Create
          </button>
        </>} 
        
      </EventForm>
      {isError && 
        <ErrorBlock 
          title="Failed to create event"
          message={error.info?.message || 'Failed to create event'}/>}
    </Modal>
  );
}
