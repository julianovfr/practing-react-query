import { Link, Outlet, useParams,useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../Header.jsx';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import ErrorBlock  from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx'


export default function EventDetails() {
  const [isDeliting, setIsDeliting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events', 'details', id],
    queryFn: () => fetchEvent({id}),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: errorDeletion
  } = useMutation({
    mutationFn: () => deleteEvent({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        //refetch none faz com que o refetch 
        //automatico seja refeito
        //somente quando solicitado
        refetchType: 'none'
      });
      navigate('/events');
    }
  });

  function handleStartDelete(){
    setIsDeliting(true);
  }

  function handleDelete(){
    mutate({id});
  }

  function handleStopDelete(){
    setIsDeliting(false);
  }

  return (
    <>
    {isDeliting &&
      <Modal onClose={handleStopDelete}>
        <h2>Are you sure you want do delte?</h2>
        <div className="form-actions">
          {isPendingDeletion && <p>Deleting, please waiting...</p>}
          {!isPendingDeletion && (
            <>
              <button onClick={handleStopDelete} className='button-text'>Cancel</button>
              <button onClick={handleDelete} className='button'>Delete</button>
            </>  
          )}
        </div>
        {isErrorDeleting && 
          <ErrorBlock 
            title="Failed to delete event"
            message="Try again later"/>
        }
      </Modal>
    }

      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && <p>Loading details..</p>}
      {isError && 
        <ErrorBlock
          title = "Failed to load details events" 
          message = "Please try again later"
        />}
      {data && <article id="event-details">
        <header>
          <h1>{data?.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
        <img src={"http://localhost:3212/" + data?.image} alt="imagem do evento" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data?.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{data?.date} @ {data?.time}</time>
            </div>
            <p id="event-details-description">{data?.description}</p>
          </div>
        </div>
      </article>}
      
    </>
  );
}
