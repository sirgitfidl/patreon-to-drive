import dotenv from 'dotenv'
import { google } from 'googleapis'

dotenv.config()

const CLIENT_ID = process.env.DRIVE_CLIENT_ID
const CLIENT_SECRET = process.env.DRIVE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.DRIVE_REFRESH_TOKEN
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive_api_v3 = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

const drive_api_v2 = google.drive({
  version: 'v2',
  auth: oauth2Client,
});

/*
* Removes former Patrons from Google Drive
*/
export async function checkPatreonVsDriveAccounts(emails, DIR_LIST) {
  try {
    var drivePermissionIdArray = []
    for (let i = 0; i < DIR_LIST.length; i++) {
      drivePermissionIdArray[i] = await getFilePermissionIdList(DIR_LIST[i])
    }

    var patreonPermissionIdArray = []
    for (let i = 0; i < emails.length; i++) {
      patreonPermissionIdArray[i] = await getUserPermissionId(emails[i])
    }

    var driveIdsArray = drivePermissionIdArray.toString().split(',')

    var unauthorized = await findUnauthorized(driveIdsArray.filter(Number), patreonPermissionIdArray.filter(Number))
    for (let i = 0; i < unauthorized.length; i++) {
      for (let j = 0; j < DIR_LIST.length; j++) {
        revokeFilePerms(DIR_LIST[j], unauthorized[i])
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}

/*
* finds and orders directory ids
*/
export async function checkRewardDirAccessibility(rewardDirId, rewardDirNames) {
  try {
    const rewardName = await (await drive_api_v3.files.get({
      fileId: rewardDirId,
    })).data.name

    if (rewardDirNames.includes(rewardName)) {
      return true
    }
    else {
      return false
    }
  } catch (error) {
    console.error(error.message);
  }
}

/*
* for directories particular tier levels should be able to access
*/
export async function coordinatePermissions(email, fileId, notify) {
  try {
    const userPermId = await getUserPermissionId(email)
    const access = await doesUserHaveAccess(userPermId, fileId)
    if (!access) {
      await grantFilePerms(email, fileId, notify)
    }
  } catch (error) {
    console.error(error.message);
  }
}

/*
* for directories off-limits to particular tier levels
*/
export async function coordinateRestrictions(email, fileId) {
  try {
    const userPermId = await getUserPermissionId(email)
    const access = await doesUserHaveAccess(userPermId, fileId)
    if (access) {
      await revokeFilePerms(fileId, userPermId)
    }
  } catch (error) {
    console.error(error.message);
  }
}

/*
* determines whether or not a user already has access to a file/directory
*/
async function doesUserHaveAccess(userPermId, userFileId) {
  try {
    var input = await drive_api_v3.permissions.get({
      fileId: userFileId,
      permissionId: userPermId,
    })
    if (userPermId == input.data.id) {
      return true
    }
    else {
      return false
    }
  } catch (error) {
    console.log(error.message);
    return false
  }
}

/*
* Finds users that have drive permissions but aren't patrons
*/
async function findUnauthorized(arr1, arr2) {
  try {
    var unauthorized = []
    for (let i = 0; i < arr1.length; i++) {
      if (!arr2.includes(arr1[i])) {
        unauthorized[i] = arr1[i]
      }
    }
    return unauthorized
  } catch (error) {
    console.error(error.message);
  }
}

/*
* gets all child file ids from a given parent directory
*/
export async function getChildIdsArray(parent_dir_id) {
  try {
    var rewardDirs = []

    const childFiles = await (await drive_api_v2.children.list({
      folderId: parent_dir_id,
    })).data.items

    for (let i = 0; i < childFiles.length; i++) {
      rewardDirs[i] = childFiles[i].id
    }

    return rewardDirs
  } catch (error) {
    console.error(error.message);
  }
}

/*
* gets a direcoty's id number by its name
*/
export async function getDirIdArrayByName(fileName) {
  try {
    const fileArray = await (await drive_api_v3.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder'`,
    })).data.files

    for (let i = 0; i < fileArray.length; i++) {
      if (fileArray[i].name == fileName) {
        return fileArray[i].id
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}

/*
* gets a file's name by it's id
*/
export async function getFileName(fileList) {
  try {
    return await (await drive_api_v3.files.get({
      fileId: fileList[i],
    })).data.name
  } catch (error) {
    console.error(error.message);
  }
}

/*
* gets a file's name by it's id
*/
export async function getFileNameArray(fileList) {
  try {
    var array = []
    for (let i = 0; i < fileList.length; i++) {
      array[i] = await (await drive_api_v3.files.get({
        fileId: fileList[i],
      })).data.name
    }
    return array
  } catch (error) {
    console.error(error.message);
  }
}

/*
* gets list of all permission ids associated with a file/directory (except the owner)
*/
async function getFilePermissionIdList(file) {
  try {
    var idList = []
    const OWNER_PERMISSION_ID = await getOwnerId()
    const input = await drive_api_v3.permissions.list({
      fileId: file,
      q: `mimeType = 'application/vnd.google-apps.folder'`,
    })

    for (let i = 0; i < input.data.permissions.length; i++) {
      if (input.data.permissions[i].id != OWNER_PERMISSION_ID) {
        idList[i] = input.data.permissions[i].id
      }
    }
    return idList
  } catch (error) {
    console.error(error.message);
  }
}

/*
* gets a file's name by it's id
*/
export async function getOwnerId() {
  try {
    return await (await drive_api_v3.about.get({
      fields: 'user'
    })).data.user.permissionId
  } catch (error) {
    console.error(error.message);
  }
}

/*
* determines a users permission id given their email address
*/
async function getUserPermissionId(emailAddress) {
  try {
    const input = await drive_api_v2.permissions.getIdForEmail({
      email: emailAddress,
    })
    return input.data.id
  } catch (error) {
    console.error(error.message);
  }
}

/*
* gives a user access to a file/directory
*/
async function grantFilePerms(email, fileId, notify) {
  try {
    await drive_api_v3.permissions.create({
      fileId: fileId,
      sendNotificationEmail: notify,
      requestBody: {
        role: 'reader',
        type: 'user',
        emailAddress: email,
      },
    })
  } catch (error) {
    console.error(error.message);
  }
}

/*
* deletes a user's access to a file/directory
*/
async function revokeFilePerms(fileId, userPermId) {
  try {
    await drive_api_v3.permissions.delete({
      fileId: fileId,
      permissionId: userPermId,
    })
  } catch (error) {
    console.log(error.message);
  }
}
