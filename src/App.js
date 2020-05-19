import React, { Fragment, useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Card from './components/Card/Card';
import Form from './components/Form/Form';
import NavBar from './components/NavBar/NavBar';
import PieChart from './components/PieChart/PieChart';
import {Progress} from 'antd';
import { Modal} from 'antd';
import {
  Switch,
  Route,
  useLocation,
} from "react-router-dom";
import NoMatch from './pages/NoMatch/NoMatch';

const App = () => {
  let location = useLocation();

  //State
  const [dataChart, setDataChart] = useState({
    labels: [],
    datasets: [
        {
            label: 'Sebaran Keluhan',
            data: [],
            backgroundColor: [
                'rgb(255,61,103)',
                'rgb(54,162,235)',
                'rgb(255,205,86)',
                'rgb(75,192,192)',
            ],
        }
    ]
})
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [data, setData] = useState({
    nim : '',
    email: '',
    keluhan: ''
  })

  useEffect( () =>{

    let newLabel = []
    let newData = []
    
    const apiRequest = async () => {
      await fetch('https://backend-complaint.herokuapp.com/api-mobile/banyak-complaint/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(async data => {
      await data.data.map(value => {
        return newLabel.push(value.nama)
      })

      await data.data.map(value => {
        return newData.push(value.jumlah)
      })
    })
    }

    apiRequest();
    setDataChart({
      labels: newLabel,
        datasets: [
            {
                label: 'Sebaran Keluhan',
                data: newData,
                backgroundColor: [
                    'rgb(255,61,103)',
                    'rgb(54,162,235)',
                    'rgb(255,205,86)',
                    'rgb(75,192,192)',
                ],
            }
        ]
    })
    setLoading(false);
  },[])

  //Fungsi yg akan dikirim sebagai props ke component Form
  const onButtonClick = () => {
    if (data.nim !== '' || data.email !== '' || data.keluhan !== '') {
      setVisible(true);
    }
  }

  const handleChange = (event) => {
    setData({
        ...data,
        [event.target.name] : event.target.value
    })
}

const complaint = (data) => {
  return new Promise(async (resolve, reject) => {

    await fetch('https://backend-complaint.herokuapp.com/api-mobile/complaint-create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "keluhan" : data.keluhan
      })
    })
    .then(res => res.json())
    .then(data => {
      //do here
      console.log(data);
      if (data.success === true) {
        resolve(data)
        // setConfirmLoading(false);
        // setVisible(false);
        // //Show modal success
        // success();

      }
      else {
        reject('error')
        // setVisible(false);
        // setConfirmLoading(false);
        // //Show modal error
        // error();
      }
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  })
} // raw complaint

const rawComplaint = (data) => {
  return new Promise(async (resolve, reject) => {
    await fetch('https://backend-complaint.herokuapp.com/api-web/complaint/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
      //do here
      // console.log(data);
      if (data.success === true) {
        resolve(data)
      }
      else {
        reject('error')
      }
    })
    .catch(err => {
      reject(err)
    })
  })
}

  //Function Modal

  const handleOk = async () => {
    setConfirmLoading(true);

    Promise.all([rawComplaint(data), complaint(data)])
    .then(response => {
      console.log(response);
      setConfirmLoading(false);
      setVisible(false);
      //Show modal success
      success();
    })
    .catch(err => {
      console.log(err)
      setVisible(false);
      setConfirmLoading(false);
      //Show modal error
      error();
    })
  }

  const success = () => {
    Modal.success({
      content: 'Berhasil',
    });
  }

  const error = () => {
    Modal.error({
      title: 'Error',
      content: 'Tidak dapat mengirim keluhan',
    });
  }

  const handleCancel = () => {
    setVisible(false);
  }

  if (loading===true) {
    return (
      <div className="loading">
        <Progress percent={100} status="active" showInfo={false} strokeWidth={15}/>
        <p>Please Wait . . .</p>
      </div>
    );
  }
  else {
    return (
      <Fragment>
        {console.log(dataChart)}
        <NavBar/>
        {location.pathname === '/' && <Header name={'Home'}/>}
        {location.pathname === '/keluhan' && <Header name={'Form Keluhan'}/>}
        {location.pathname === '/statistik' && <Header name={'Statistik'}/>}
        {location.pathname === '/diagram' && <Header name={'Diagram Alir'}/>}

        {/* Route */}
        <Switch>
          <Route exact path="/">
            <Card/>
          </Route>
          <Route path="/keluhan">
            <Form onButtonClick={onButtonClick} handleFormChange={handleChange}/>
          </Route>
          <Route path="/statistik">
              <PieChart dataChart={dataChart}/>
          </Route>
          <Route path="/diagram">
            {/* Diagram Alir */}
          </Route>
          <Route path="*">
            <NoMatch/>
          </Route>

        </Switch>

        {/* Modal */}
        <div>
          <Modal
            title="Keluhan"
            visible={visible}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
          >
            <p>Keluhan anda akan dikirim kepihak terkait</p>
          </Modal>
        </div>
      </Fragment>
  );
  }
}

export default App;
