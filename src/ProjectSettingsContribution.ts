/**
 * Contribution for the project settings consisting of the Teamscale URL and project
 */
import {ProjectSettings} from './Settings/ProjectSettings';
import {Scope} from './Settings/Scope';
import {Settings} from './Settings/Settings';
import {getCurrentTimestamp} from './Utils/UiUtils';
import UiUtils = require('./Utils/UiUtils');

let settings: ProjectSettings = null;

const teamscaleUrlInput = document.getElementById('teamscale-url') as HTMLInputElement;
const teamscaleProjectInput = document.getElementById('teamscale-project') as HTMLInputElement;
const saveButtonElement = document.getElementById('save-button') as HTMLButtonElement;
const logDiv = document.getElementById('log') as HTMLDivElement;
const useSeparateTestGapServerInput = document.getElementById('use-extra-tga-server') as HTMLInputElement;
const tgaConfigurationDiv = document.getElementById('extra-tga-configuration') as HTMLDivElement;
const tgaTeamscaleUrlInput = document.getElementById('tga-teamscale-url') as HTMLInputElement;
const tgaTeamscaleProjectInput = document.getElementById('tga-teamscale-project') as HTMLInputElement;
const showTestGapBadgeInput = document.getElementById('show-work-item-tga-badge') as HTMLInputElement;
const showFindingsBadgeInput = document.getElementById('show-work-item-tqe-badge') as HTMLInputElement;

const projectSeparator: string = ',';

VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true,
});

VSS.ready(() => {
    const azureProjectName = VSS.getWebContext().project.name;
    settings = new ProjectSettings(Scope.ProjectCollection, azureProjectName);

    saveButtonElement.onclick = () => saveFormValues();
    useSeparateTestGapServerInput.onchange = () => zipTgaConfiguration();

    try {
        loadCurrentSettings();
    } catch (e) {
        VSS.notifyLoadFailed(e);
    }
});

async function loadCurrentSettings() {
    teamscaleUrlInput.value = await settings.get(Settings.TEAMSCALE_URL_KEY);
    tgaTeamscaleUrlInput.value = await settings.get(Settings.TGA_TEAMSCALE_URL_KEY);
    useSeparateTestGapServerInput.checked = UiUtils.convertToBoolean(await settings.get(Settings.USE_SEPARATE_TEST_GAP_SERVER));
    showFindingsBadgeInput.checked = UiUtils.convertToBoolean(await settings.get(Settings.SHOW_FINDINGS_BADGE_KEY));
    showTestGapBadgeInput.checked = UiUtils.convertToBoolean(await settings.get(Settings.SHOW_TEST_GAP_BADGE_KEY));

    const projects = await settings.getProjectsList(Settings.TEAMSCALE_PROJECTS_KEY);
    const tgaProjects = await settings.getProjectsList(Settings.TGA_TEAMSCALE_PROJECTS_KEY);
    teamscaleProjectInput.value = projects.join(projectSeparator);
    tgaTeamscaleProjectInput.value = tgaProjects.join(projectSeparator);

    zipTgaConfiguration();
    VSS.notifyLoadSucceeded();
}

function zipTgaConfiguration() {
    if (useSeparateTestGapServerInput.checked) {
        tgaConfigurationDiv.style.display = 'block';
        return;
    }
    tgaConfigurationDiv.style.display = 'none';
}

function saveUrlAndProject(teamscaleUrl: string, teamscaleProject: string, serverUrlKey: string, projectNameKey: string) {
    let teamscaleProjects: string[] = teamscaleProjectInput.value.split(projectSeparator);
    teamscaleProjects = teamscaleProjects.map(entry => entry.trim());
    if (teamscaleUrl.endsWith('/')) {
        teamscaleUrl = teamscaleUrl.substring(0, teamscaleUrl.length - 1);
    }

    logDiv.innerHTML = '';

    settings.save(serverUrlKey, teamscaleUrl)
        .then(url => createSuccessfulLog('Teamscale URL', url), () => createFailedLog('Teamscale URL'));

    settings.saveProjectsList(projectNameKey, teamscaleProjects)
        .then(projects => createSuccessfulLog('Teamscale Projects', projects), () => createFailedLog('Teamscale Projects'));
}

function createSuccessfulLog(valueDescription: string, value: string) {
    UiUtils.logToDiv(logDiv, `${getCurrentTimestamp()} Saving ${valueDescription} "${value ? value : ''}" successful.`);
}

function createFailedLog(valueDescription: string) {
    UiUtils.logToDiv(logDiv, `${getCurrentTimestamp()} Error saving ${valueDescription}.`);
}

/**
 * Saves the entered TS Server an Project values to the Project settings.
 */
function saveFormValues() {
    saveUrlAndProject(teamscaleUrlInput.value, teamscaleProjectInput.value, Settings.TEAMSCALE_URL_KEY,
        Settings.TEAMSCALE_PROJECTS_KEY);
    saveUrlAndProject(tgaTeamscaleUrlInput.value, tgaTeamscaleProjectInput.value, Settings.TGA_TEAMSCALE_URL_KEY,
        Settings.TGA_TEAMSCALE_PROJECTS_KEY);

    settings.save(Settings.SHOW_TEST_GAP_BADGE_KEY, String(showTestGapBadgeInput.checked))
        .then(showTestGapBadge => createSuccessfulLog('Show Test Gap Badge Option', showTestGapBadge),
            () => createFailedLog('Show Test Gap Badge Option'));

    settings.save(Settings.SHOW_FINDINGS_BADGE_KEY, String(showFindingsBadgeInput.checked))
        .then(showFindingsBadge => createSuccessfulLog('Show Findings Churn Badge Option', showFindingsBadge),
            () => createFailedLog('Show Findings Churn Badge Option'));

    settings.save(Settings.USE_SEPARATE_TEST_GAP_SERVER, String(useSeparateTestGapServerInput.checked))
        .then(extraTgaServer => createSuccessfulLog('Use Extra Test Gap Server Option', extraTgaServer),
            () => createFailedLog('Use Extra Test Gap Option'));
}
