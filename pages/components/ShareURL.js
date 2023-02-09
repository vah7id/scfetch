/* eslint-disable react/prefer-stateless-function */
/* eslint-disable import/no-unresolved, import/extensions, import/no-extraneous-dependencies */
import { Button, Menu,styled } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import React, { Component } from 'react';
import {
  FacebookShareCount,
  PinterestShareCount,
  VKShareCount,
  OKShareCount,
  RedditShareCount,
  TumblrShareCount,
  HatenaShareCount,
  FacebookShareButton,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  LinkedinShareButton,
  TwitterShareButton,
  PinterestShareButton,
  VKShareButton,
  OKShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  RedditShareButton,
  EmailShareButton,
  TumblrShareButton,
  LivejournalShareButton,
  MailruShareButton,
  ViberShareButton,
  WorkplaceShareButton,
  LineShareButton,
  WeiboShareButton,
  PocketShareButton,
  InstapaperShareButton,
  HatenaShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  PinterestIcon,
  VKIcon,
  OKIcon,
  TelegramIcon,
  WhatsappIcon,
  RedditIcon,
  TumblrIcon,
  MailruIcon,
  EmailIcon,
  LivejournalIcon,
  ViberIcon,
  WorkplaceIcon,
  LineIcon,
  PocketIcon,
  InstapaperIcon,
  WeiboIcon,
  HatenaIcon,
} from 'react-share';
import styles from '../../styles/Home.module.css'

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

export default function ShareURL({shareUrl, title}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  const handleClick = (event) => {
    setOpen(!open);
  };
  const handleClose = () => {
    setOpen(false);
  };
    return (
      <>
      <Button
      style={{ padding: '0px 10px 0px 20px'}}
        id="demo-customized-button"
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        color="secondary"
        disableElevation
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleClick}
      >
        SHARE WITH...
      </Button>
      {open && <div className={styles.ShareContainer}>
        <div className={styles.shareNetwork}>
          <FacebookShareButton
            url={shareUrl}
            quote={title}
            className="share-network__share-button"
          >
            <FacebookIcon size={24} round />
          </FacebookShareButton>

        </div>

        <div className={styles.shareNetwork}>
          <TwitterShareButton
            url={shareUrl}
            title={title}
            className="share-network__share-button"
          >
            <TwitterIcon size={24} round />
          </TwitterShareButton>

        </div>

        <div className={styles.shareNetwork}>
          <TelegramShareButton
            url={shareUrl}
            title={title}
            className="share-network__share-button"
          >
            <TelegramIcon size={24} round />
          </TelegramShareButton>

        </div>

        <div className={styles.shareNetwork}>
          <WhatsappShareButton
            url={shareUrl}
            title={title}
            separator=":: "
            className="share-network__share-button"
          >
            <WhatsappIcon size={24} round />
          </WhatsappShareButton>

        </div>

        <div className={styles.shareNetwork}>
          <LinkedinShareButton url={shareUrl} className="share-network__share-button">
            <LinkedinIcon size={24} round />
          </LinkedinShareButton>
        </div>



        <div className={styles.shareNetwork}>
          <RedditShareButton
            url={shareUrl}
            title={title}
            windowWidth={660}
            windowHeight={460}
            className="share-network__share-button"
          >
            <RedditIcon size={24} round />
          </RedditShareButton>

        
        </div>

        <div className={styles.shareNetwork}>
          <TumblrShareButton
            url={shareUrl}
            title={title}
            className="share-network__share-button"
          >
            <TumblrIcon size={24} round />
          </TumblrShareButton>

          <div>
          </div>
        </div>

        <div className={styles.shareNetwork}>
          <EmailShareButton
            url={shareUrl}
            subject={title}
            body="body"
            className="share-network__share-button"
          >
            <EmailIcon size={24} round />
          </EmailShareButton>
        </div>
        <div className={styles.shareNetwork}>
          <ViberShareButton
            url={shareUrl}
            title={title}
            className="share-network__share-button"
          >
            <ViberIcon size={24} round />
          </ViberShareButton>
        </div>

        <div className={styles.shareNetwork}>
          <WorkplaceShareButton
            url={shareUrl}
            quote={title}
            className="share-network__share-button"
          >
            <WorkplaceIcon size={24} round />
          </WorkplaceShareButton>
        </div>

        <div className={styles.shareNetwork}>
          <LineShareButton
            url={shareUrl}
            title={title}
            className="share-network__share-button"
          >
            <LineIcon size={24} round />
          </LineShareButton>
        </div>


        <div className={styles.shareNetwork}>
          <PocketShareButton
            url={shareUrl}
            title={title}
            className="share-network__share-button"
          >
            <PocketIcon size={24} round />
          </PocketShareButton>
        </div>

      </div>}
      </>
    );
  
}
