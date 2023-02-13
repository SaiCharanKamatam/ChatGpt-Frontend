import { useState } from 'react';
import './App.css';
import axios from "axios"

function App() {
  const [details, setDetails] = useState({ "noOfQuestions": "select", "topic": "", "topicData": "" })
  const [response, setResponse] = useState([])
  const [rendering, setRender] = useState({ "select": true, "input": false, "next": true, "textArea": false })
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState(true)
  const [get, setGet] = useState(false)
  const [getTopic, setTopic] = useState("")
  const [topicQuestions,setTopicQuestions] = useState([])
  const [Q,setQ] = useState(false)
  const chatGpt = (e) => {
    if (details.topicData !== "") {
      setRender({ ...rendering, "textArea": false })
      setInput(false)
      setLoading(true)
      e.preventDefault()
      const message = `create ${details.noOfQuestions} mutiple choice questions on ${details.topic} with options and answers \n ${details.topicData}.`
      axios.post("http://127.0.0.1:5000/questions", { promptMessage: message ,len:details.noOfQuestions})
        .then((data) => {
          console.log(data.data)
          setLoading(false)
          setResponse(data.data.data)
        })
        .catch((err) => {
          alert("enter proper prompt to get the appropriate results")
          window.location.reload()
        })

    }

  }

  const handleQuestions = () => {

    if (details.noOfQuestions !== "select") {
      setRender({ ...rendering, "select": false, "input": true })

    }
    if (details.topic !== "") {
      setRender({ ...rendering, "input": false, "textArea": true, "next": false })
    }
  }

  const handleInsertion = (arrOfQuestionAandOptions) => {
    const QAS = arrOfQuestionAandOptions.split("*")
    console.log(arrOfQuestionAandOptions.split("*"));
    const message = {
      "topic": details.topic.toLowerCase(),
      "question":QAS[0][0] == "Q" ? QAS[0].slice(4) : QAS[0].slice(3),
      "optionA": QAS[1].slice(3),
      "optionB": QAS[2].slice(3),
      "optionC": QAS[3].slice(3),
      "optionD": QAS[4].slice(3),
      "answer" : QAS[5].slice(3),
    }
    axios.post("http://127.0.0.1:5000/add", { promptMessage: message })
      .then((data) => {
          alert(data.data)
          console.log(data.data);
      })
      .catch((err) => {
        alert(err.message)
      })
  }
  
  const getReqQuestions = ()=>{
    console.log(getTopic);
    axios.post("http://127.0.0.1:5000/getTopic", { promptMessage: getTopic.toLowerCase() })
    .then((data) => {
     console.log(data.data);
     setQ(true)
     setTopicQuestions(data.data)
    })
    .catch((err) => {
      alert(err.message)
    })

  }
  return (
    <div>
      {
        get ? <div id='getQuestions' >
          <label htmlFor='topic-input'>Enter topic 
          <input id='topic-input' value={getTopic} onChange={(e) => setTopic(e.target.value)} />
          </label>
          <button  className='ADB' onClick={getReqQuestions} >Enter</button>
          {Q ? <div>
          {topicQuestions.data != "no related questions" ?
              <div id='output-box'>
                {
                  topicQuestions.map((dic, i) => {

                    return (
                      <div key={i}>
                        <div>{`Q${i+1}. ${dic.question}`}</div>
                        <div id='optionss'>
                          <span className='choices' >{`A. ${dic.optionA}`}</span>
                          <span className='choices' >{`B. ${dic.optionB}`}</span>
                          <span className='choices' >{`C. ${dic.optionC}`}</span>
                          <span className='choices' >{`D. ${dic.optionD}`}</span>
                        </div>
                      </div>
                    )
                  })
                }
              </div> : <div>"No related questions"</div>
            } </div>
            : null }
        </div> :
          <div className="App">
            <h1>ChatGpt</h1>
            {
              input ? <div id='input-box'>
                {rendering.select ?
                  <div>
                    <label htmlFor='dropdown' id='drop-label' >Select the number of questions</label>
                    <select id='dropdown' className='select' value={details.noOfQuestions} onChange={(e) => setDetails({ ...details, "noOfQuestions": e.target.value })} >
                      <option value={"none"}  >select</option>
                      <option value={1}  >1</option>
                      <option value={2}  >2</option>
                      <option value={3}  >3</option>
                      <option value={4}  >4</option>
                    </select>
                  </div> : null}
                {
                  rendering.input ?
                    <div>
                      <label htmlFor='topic' id='topic-label'>Choose the topic</label>
                      <input id="topic" value={details.topic} onChange={(e) => setDetails({ ...details, "topic": e.target.value })} />
                    </div>
                    : null
                }
                {
                  rendering.next ? <button id='next' onClick={() => handleQuestions()} >Next</button> : null
                }
                {
                  rendering.textArea ?
                    <div id='text-area'>
                      <textarea id='chatgpt-input' placeholder='Enter your prompt' value={details.topicData} onChange={(e) => setDetails({ ...details, "topicData": e.target.value })} ></textarea>
                      <input type='submit' value="Enter" id='submit-btn' onClick={(e) => chatGpt(e)} />
                    </div>
                    : null
                }
              </div> : null
            }
            {
              loading ? <div id='loading'>The Questions are loading</div> : null
            }
            {response.length > 0 ?
              <div id='output-box'>
                {
                  response.map((str, i) => {
                    const a = `${str.question}*${str.optionA}*${str.optionB}*${str.optionC}*${str.optionD}*${str.answer}`
                    return (
                      <div key={i} className="QAP" >
                        <div>{str.question}</div>
                        <div id='optionss'>
                          <span className='choices'>{str.optionA}</span>
                          <span className='choices'>{str.optionB}</span>
                          <span className='choices'>{str.optionC}</span>
                          <span className='choices'>{str.optionD}</span>
                        </div>
                        <button value={a} className="ADB" onClick={(e) => handleInsertion(e.target.value)} >Add to Database</button>
                      </div>
                    )
                  })
                }
              </div> : null
            }
            {
              loading ? null : <button id='TBQ' onClick={() => setGet(true)} >Click here to get Topic based questions</button>
            } 
          </div>
      }
    </div>
  );
}

export default App;
