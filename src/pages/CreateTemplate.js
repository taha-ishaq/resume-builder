import React, { useEffect, useState } from 'react'
import { FaTrash, FaUpload } from 'react-icons/fa6'
import { PuffLoader } from 'react-spinners'
import { ToastContainer, toast } from 'react-toastify'
import {deleteObject, getDownloadURL, ref, uploadBytesResumable} from 'firebase/storage'
import { storage,db } from '../config/firebase.config'
import { upload } from '@testing-library/user-event/dist/upload'
import { progress } from 'framer-motion'
import { adminIds, initialTags } from '../utils/Helpers'
import { Timestamp, serverTimestamp, setDoc, doc,deleteDoc } from 'firebase/firestore'
import useTemplates from '../hooks/useTemplates'
import { getTemplates } from '../api'
import useUser from '../hooks/useUser'
import { useNavigate } from 'react-router-dom'
import { replaceAt } from 'react-query/types/core/utils'

const CreateTemplate = () => {

    const [selectedTags, setSelectedTags] = useState([]);

        const {data :templates,isLoading:templatesIsLoading,isError :templatesIsError,refetch :templatesRefetch}
        = useTemplates();
        const {data : user , isLoading}=useUser();

        const navigate= useNavigate();
        const handleSelectedTags = (tag) =>{
            if(selectedTags.includes(tag)){
                setSelectedTags(selectedTags.filter(selected => selected !== tag))
            }else{
                setSelectedTags([...selectedTags , tag]);
            }
        }

    const [formData , setFormData] = useState({
        title: "",
        imageURL: null,
    })

    const handleInputChange= (e)=>{
        const {name, value}= e.target
        setFormData((prevRec ) => ({...prevRec, [name]:value}))
    }

    const [imageAsset, setImageAsset] = useState({
        isImageLoading :false,
        uri: null,
        progress : 0
    })

    const handleFileSelect =  (e) =>{
        setImageAsset((prevAsset) =>({...prevAsset,isImageLoading:true }));
        const file= e.target.files[0];
        if(file && isAllowed(file)){
            const storageRef = ref(storage, `Templates/${Date.now()}-${file.name}`);
            
            const uploadTask = upload =uploadBytesResumable(storageRef, file );

            uploadTask.on('state_changed',(snapshot) =>{
                setImageAsset((prevAsset) => ({...prevAsset,progress:(snapshot.bytesTransferred / snapshot.totalBytes) *100,}))
            },(error)=>{
                if(error.message.includes("storage/unauthorized")){
                    toast.error(`Error : Authorization Revoked`)
                }else{
                    toast.error(`Error :${error.message}`)
                }
            },
            () =>{
                getDownloadURL(uploadTask.snapshot.ref).then(downloadURL =>{
                    setImageAsset((prevAsset) => ({...prevAsset,
                        uri:downloadURL,
                }));
            });
            toast.success("Image Uploaded");
            setInterval(()=>{
                setImageAsset((prevAsset) =>({
                    ...prevAsset,
                    isImageLoading:false
                }))
            },2000)
        },
            )}else{
                toast.info("Invalid file format")
            }

    };
    const isAllowed = (file) =>{
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        return allowedTypes.includes(file.type);
    }

    const deleteAnImageObject = async() =>{
        
        const delRef = ref(storage, imageAsset.uri);
        deleteObject(delRef).then(()=>{
            toast.success("Image Deleted");
            setInterval(()=>{
                setImageAsset((prevAsset) =>({
                    ...prevAsset,
                    progress: 0,
                    uri: null,
                    
                }))
            },2000)
        });
    }
    const pushToCloud = async() =>{
        const timestamp = serverTimestamp();
        const id = `${Date.now()}`;
        const _doc = {
            _id:id,
            title: formData.title,
            imageURL : imageAsset.uri,
            tags: selectedTags,
            name : templates && templates.length > 0 ? `Templates${templates.length + 1}`: "Template1",
            timeStamp : timestamp,
        };
        await setDoc(doc(db,"templates",id), _doc).then(()=>{
            setFormData((prevData)=> ({...prevData, title:"", imageURL:""}));
            setImageAsset((prevAsset)=> ({...prevAsset, uri:null}));
            setSelectedTags([]);
            templatesRefetch();
            
            toast.success("Data pushed to the cloud")
        })
    }

    const removeATemplate= async(template)=>{
        const deleteRef= ref(storage,template?.imageURL)
        await deleteObject(deleteRef).then(async()=>{
            await deleteDoc(doc(db,"templates",template?._id)).then(()=>{
                toast.success("Template Deleted Successfully");
                templatesRefetch();
            }).catch(err=>{
                toast.error(`Error : ${err.message}`)
            })
        })
    }

    useEffect(()=>{
        if(!isLoading && !adminIds.includes(user?.uid)){
            navigate("/",{replace:true});
        }
    },[user, isLoading   ])
  
     
  return (
    <div className='w-full px-4 grid lg:px-10 2xl:px-32 py-4 grid-cols-1 lg:grid-cols-12'>

    {/*left*/}
    <div className='col-span-12 lg:col-span-4  2xl:col-span-3w-full flex flex-1 items-center justify-start flex-col gap-4 px-2 '>
    <div className='w-full '>
        <p className='text-lg text-txtPrimary'> Create a new Template</p>
    </div>

    {/*template id section */}
    <div className='w-full flex items-center justify-end '>
        <p className='text-base text-txtLight uppercase font-semibold'>
            TempId:{""}
        </p>
        <p className='text-sm text-txtDark  capatalize font-bold'>
            {templates && templates.length > 0 ? `Template${templates.length + 1}`: "Template1"}
        </p>
    </div>
    {/*template tile section*/}
    <input type='text' placeholder='Template Title' value={formData.title} onChange={handleInputChange}
    name='title' className='w-full px-4 py-3 rounded-md bg-transparent border border-gray-300 text-lg text-txtPrimary focus:text-txtDark focus:shadow-md outline-none' />


    <div className='w-full bg-gray-100 backdrop-blur-md h-[420px] lg:h-[620px] 2xl:h-[740px] rounded-md border-2 border-dotted border-gray-300 curson-pointer flex items-center justify-center'>
        {imageAsset.isImageLoading ?(<React.Fragment>
            <div className='flex flex-col justify-center items-center gap-4 '>
                <PuffLoader color='#498FCD' size={40} />
                <p>{imageAsset?.progress.toFixed(2)}%</p>
            </div>
        </React.Fragment>) : (
            <React.Fragment>
                {!imageAsset?.uri ? <React.Fragment>
                    <label className='w-full cursor-pointer h-full '>
                        <div className='flex flex-col items-center justify-center h-full w-full'>
                            <div className='flex items-center justify-center cursor-pointer flex-col gap-4'>
                                <FaUpload className='text-2xl' />
                                <p className='text-lg text-txtLight'> Click To Upload</p>
                            </div>
                        </div>
                        <input type='file'  className='w-0 h-0' accept=".jpg , .jpeg, .png" onChange={handleFileSelect} />
                    </label>
                </React.Fragment> :
                <React.Fragment>
                    <div className='relative w-full h-full overflow-hidden rounded-md '>
                        <img src={imageAsset?.uri } alt='' className='w-full h-full object-cover ' loading='lazy' />
                        <div className='absolute top-4 right-4 w-8 h-8 rounded-md flex items-center justify-center bg-red-500 cursor-pointer'>
                            <FaTrash className='text-sm text-white' onClick={deleteAnImageObject} /></div> 
                    </div>
                    </React.Fragment>}
            </React.Fragment>
        )}
    </div>
  
                    <div className='w-full h-full flex flex-wrap gap-2'>
                        {initialTags.map((tag,i)=>(
                            <div key={i} onClick={()=> handleSelectedTags(tag)} className={`border border-gray-300 px-1 py-1 rounded-md cursor-pointer ${selectedTags.includes(tag)?
                                "bg-blue-500 text-white" :""}`}>
                                <p className='text-xs'>{tag}</p>
                            </div>
                        ))}
                    </div>

                    <button type='button' className='w-full bg-blue-700 text-white rounded-md py-3'onClick={pushToCloud}>
                        Save
                    </button>


    </div>





        <div className='col-span-12 lg:col-span-8  2xl:col-span-9 px-2  w-full flex-1 py-4 '>
                {templatesIsLoading ? (<React.Fragment>
                    <div className='w-full h-full flex items-center justify-center'>
                        <PuffLoader color='#498FCD' size={40}/>
                    </div>
                    
                     </React.Fragment>) : <React.Fragment>
                        {templates && templates.length > 0 ?( <React.Fragment>
                            <div className='w-full h-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4'>
                           {templates?.map((template)=>(
                            <div key={template._id} className='w-full h-[500px] rounded-md overflow-hidden relative '>
                                <img src={template?.imageURL} alt='' className='w-full h-full object-cover' />
                                <div className='absolute top-4 right-4 w-8 h-8 rounded-md flex items-center justify-center bg-red-500 cursor-pointer'>
                            <FaTrash className='text-sm text-white' onClick={()=>removeATemplate(template)} /></div>  
                            </div>

                           ))}
                        </div>
                        </React.Fragment>):(
                            <React.Fragment>
                                <div className='w-full h-full flex items-center justify-center'>
                        <PuffLoader color='#498FCD' size={40}/>
                        <p className='text-xl tracking-wider capitalize text-txtPrimary'>No Data</p>
                    </div>

                            </React.Fragment>
                        )}
                        </React.Fragment>}                  
        
        </div>

    </div>
  )
}

export default CreateTemplate