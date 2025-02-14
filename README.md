# React & Node.js Skill Test

## Estimated Time

- 60 min

## Requirements

- Bug fix to login without any issues (20min) <br/>
  ✓ email: admin@gmail.com  ✓ password: admin123

  Login Functionality fixed by adding .env variables in both client and server, 

server .env : 

```bash
DB_URL="mongourl"
```

client .env : 

```bash
REACT_APP_BASE_URL="http://127.0.0.1:5001/"
PUBLIC_URL="http://localhost:3000/"
```


- Implement Restful API of "Meeting" in the both of server and client sides (40min)<br/>

  Added all 5 function : index, add, view, deleteData and deleteMany in this directory: 

  ```bash
  server\controllers\meeting\meeting.js
  ```

  Routes :
  
  ```bash
  router.get('/', auth, meeting.index)
  router.post('/add', auth, meeting.add)
  router.get('/view/:id', auth, meeting.view)
  router.delete('/delete/:id', auth, meeting.deleteData)
  router.post('/deleteMany', auth, meeting.deleteMany)
  ```

- Integration in React client code : 

  Added fetchData() in the AddMeeting props :
  
   ```bash
   <AddMeeting setAction={setAction} fetchData={fetchData} userAction={userAction} isOpen={isOpen} onClose={onClose} />
  ```

   Added functionality in addData fetchAllData and useEffect functions : 

  ```bash
  const AddData = async () => {
        try {
            setIsLoding(true);
    
            let formattedValues = { ...values };
    
            // Validate if required fields are present
            if (!formattedValues.agenda || !formattedValues.dateTime || !formattedValues.related) {
                toast.error("Please fill all required fields!");
                setIsLoding(false);
                return;
            }
    
            let response = await postApi('api/meeting/add', formattedValues);
    
            if (response.status === 200) {
                toast.success("Meeting added successfully!");
                formik.resetForm();
                onClose();
                fetchData(1);
            }
        } catch (error) {
            console.error("Error adding meeting:", error);
        } finally {
            setIsLoding(false);
        }
    };
    
    const fetchAllData = async () => {
        if (props.id) {
            try {
                setIsLoding(true);
                let result = await getApi(`api/meeting/view/${props.id}`);
    
                if (result?.data) {
                    setFieldValue('agenda', result?.data?.agenda);
                    setFieldValue('attendes', result?.data?.attendes);
                    setFieldValue('attendesLead', result?.data?.attendesLead);
                    setFieldValue('location', result?.data?.location);
                    setFieldValue('related', result?.data?.related);
                    setFieldValue('dateTime', result?.data?.dateTime);
                    setFieldValue('notes', result?.data?.notes);
                    setFieldValue('createBy', result?.data?.createBy);
                }
            } catch (error) {
                console.error("Error fetching meeting data:", error);
            } finally {
                setIsLoding(false);
            }
        }
    };

    Handle related field changes and data loading
    useEffect(() => {
    const fetchRelatedData = async () => {
        if (view === true) {
            if (values.related === "Contact" && contactdata.length <= 0) {
                setContactData(contactList);
            } else if (values.related === "Lead" && leaddata.length <= 0) {
                setLeadData(leadData);
            }
        } else {
            try {
                let result;
                if (values.related === "Contact" && contactdata.length <= 0) {
                    result = await getApi(user.role === 'superAdmin' ? 'api/contact/' : `api/contact/?createBy=${user._id}`);
                    setContactData(result?.data);
                } else if (values.related === "Lead" && leaddata.length <= 0) {
                    result = await getApi(user.role === 'superAdmin' ? 'api/lead/' : `api/lead/?createBy=${user._id}`);
                    setLeadData(result?.data);
                }
            } catch (error) {
                console.error("Error fetching related data:", error);
            }
        }
    };

    fetchRelatedData();
  }, [values.related, view, user.role, user._id, contactList, leadData]);

  // Second useEffect - Handle data fetching for edit mode
  useEffect(() => {
      if (props.id) {
          fetchAllData();
      } else if (props.data) {
          setFieldValue('agenda', props.data?.agenda);
          setFieldValue('attendes', props.data?.attendes);
          setFieldValue('attendesLead', props.data?.attendesLead);
          setFieldValue('location', props.data?.location);
          setFieldValue('related', props.data?.related);
          setFieldValue('dateTime', props.data?.dateTime);
          setFieldValue('notes', props.data?.notes);
          setFieldValue('createBy', props.data?.createBy);
      }
  }, [props.id, props.data]);
  ```
    
