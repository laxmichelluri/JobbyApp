import {Component} from 'react'
import Cookies from 'js-cookie'
import {AiFillStar} from 'react-icons/ai'
import {BiLinkExternal} from 'react-icons/bi'
import Loader from 'react-loader-spinner'
import {MdLocationOn} from 'react-icons/md'
import Header from '../Header'
import SimilarJobs from '../SimilarJobs'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'INPROGRESS',
}

class AboutJobItem extends Component {
  state = {
    jobDataDetails: [],
    similarJobsData: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getJobData()
  }

  getJobData = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })

    const jwtToken = Cookies.get('jwt_token')
    const jobDetailsApiUrl = `https://apis.ccbp.in/jobs/${id}`
    const optionsData = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const responseJobData = await fetch(jobDetailsApiUrl, optionsData)
    if (responseJobData.ok === true) {
      const fetchedData = await responseJobData.json()
      const updateData = [fetchedData.job_details].map(eachDetail => ({
        companyLogoUrl: eachDetail.company_logo_url,
        companyWebsiteUrl: eachDetail.company_website_url,
        employmentType: eachDetail.employment_type,
        id: eachDetail.id,
        jobDescription: eachDetail.job_description,
        lifeAtCompany: {
          description: eachDetail.life_at_company.description,
          imageUrl: eachDetail.life_at_company.image_url,
        },
        location: eachDetail.location,
        packagePerAnnum: eachDetail.package_per_annum,
        rating: eachDetail.rating,
        skills: eachDetail.skills.map(eachSkill => ({
          imageUrl: eachSkill.image_url,
          name: eachSkill.name,
        })),
        title: eachDetail.title,
      }))

      const updateSimilarJobDetails = fetchedData.similar_jobs.map(eachJob => ({
        companyLogoUrl: eachJob.company_logo_url,
        id: eachJob.id,
        jobDescription: eachJob.job_description,
        employmentType: eachJob.employment_type,
        location: eachJob.location,
        rating: eachJob.rating,
        title: eachJob.title,
      }))
      this.setState({
        jobDataDetails: updateData,
        similarJobsData: updateSimilarJobDetails,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderJobDetailsSuccessView = () => {
    const {jobDataDetails, similarJobsData} = this.state
    if (jobDataDetails.length >= 1) {
      const {
        companyLogoUrl,
        companyWebsiteUrl,
        employmentType,

        id,
        jobDescription,
        lifeAtCompany,
        location,
        packagePerAnnum,
        rating,
        skills,
        title,
      } = jobDataDetails[0]
      return (
        <>
          <div className="job-item-container">
            <div className="first-part-container">
              <div className="img-title-container">
                <img
                  src={companyLogoUrl}
                  alt="job details company logo"
                  className="company-logo"
                />
                <div className="title-rating-container">
                  <h1 className="title-heading">{title}</h1>
                  <div className="star-rating-container">
                    <AiFillStar className="star-icon" />
                    <p className="rating-text">{rating}</p>
                  </div>
                </div>
              </div>
              <div className="location-package-container">
                <div className="location-job-type-container">
                  <div className="location-icon-container">
                    <MdLocationOn className="location-icon" />
                    <p className="location">{location}</p>
                  </div>
                  <div className="employment-type-container">
                    <p className="job-type">{employmentType}</p>
                  </div>
                </div>
                <div className="package-container">
                  <p className="package">{packagePerAnnum}</p>
                </div>
              </div>
            </div>
            <hr className="hr-line" />
            <div className="second-part-container">
              <div className="description-container">
                <h1 className="job-heading">Description</h1>
                <a className="visit-anchor" href={companyWebsiteUrl}>
                  Visit <BiLinkExternal />
                </a>
              </div>
              <p className="description">{jobDescription}</p>
            </div>
            <h1>Skills</h1>
            <ul className="ul-job-details-container">
              {skills.map(eachSkill => (
                <li className="li-job-details-container" key={eachSkill.name}>
                  <img
                    className="skill-img"
                    src={eachSkill.imageUrl}
                    alt={eachSkill.name}
                  />
                  <p>{eachSkill.name}</p>
                </li>
              ))}
            </ul>
            <div className="company-life-container">
              <div className="life-heading-container">
                <h1>Life at Company</h1>
                <p>{lifeAtCompany.description}</p>
              </div>
              <img src={lifeAtCompany.imageUrl} alt="life at company" />
            </div>
          </div>
          <h1 className="similar-jobs-heading">Similar jobs</h1>
          <ul className="similar-jobs-ul-container">
            {similarJobsData.map(eachItem => (
              <SimilarJobs
                key={eachItem.id}
                similarJobData={eachItem}
                employmentType={employmentType}
              />
            ))}
          </ul>
        </>
      )
    }
    return null
  }

  onRetryJobDetailsAgain = () => {
    this.getJObData()
  }

  renderJobFailureView = () => (
    <div className="job-details-failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1> Oops! Something Went Wrong</h1>
      <p> we cannot seem to find the page you are looking for.</p>
      <div className="btn-failure-container">
        <button
          className="failure-btn"
          type="button"
          onClick={this.onRetryJobDetailsAgain}
        >
          retry
        </button>
      </div>
    </div>
  )

  renderJobLoadingView = () => (
    <div className="job-details-loader" data-testid="loader">
      <Loader type="ThreeDots" height={50} width={50} color="#0b69ff" />
    </div>
  )

  renderJobDetails = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderJobDetailsSuccessView()
      case apiStatusConstants.failure:
        return this.renderJobFailureView()
      case apiStatusConstants.inProgress:
        return this.renderJobLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="job-details-view-container">
          {this.renderJobDetails()}
        </div>
      </>
    )
  }
}

export default AboutJobItem
