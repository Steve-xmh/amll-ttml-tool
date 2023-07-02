<template>
    <NModal transform-origin="center" :show="settings.showingTutorial">
        <NCard title="欢迎使用 Apple Music-like Lyrics TTML 歌词工具！" style="max-width: 800px;">
            <NSpace vertical>
                <div>本工具是针对 BetterNCM 插件 Apple Music-like Lyrics 播放页面插件而专门设计的 TTML 歌词工具！</div>
                <div>因为功能相对较多，所以也适合用来制作各种格式的歌词哦！</div>
                <div>以下是简短的使用方式，希望可以让您快速上手使用它！</div>
                <NSteps vertical>
                    <NStep title="加载歌词">
                        <NSpace vertical>
                            <div>您可以通过左上角的菜单 - 文件 - 打开歌词来加载歌词哦！</div>
                            <div>如果您的歌词不是 TTML 格式也没有关系，歌词工具支持从 LRC/YRC/QRC 格式导入歌词哦！</div>
                        </NSpace>
                    </NStep>
                    <NStep title="编辑歌词">
                        <NSpace vertical>
                            <div>点击上方的 <NButton>编辑模式</NButton> 按钮即可进入编辑模式，一般默认都是编辑模式。</div>
                            <div>您可以增加新的歌词行，增加新的单词，可以对其拆分，分词，编辑哦！</div>
                            <div>要留意的是，最后保存的格式会将任何空格都完整保留，所以要留意英文单词的空格间隙哦！</div>
                            <div>如果需要增加翻译歌词行和音译歌词行，可以通过菜单 查看 - 显示翻译/音译歌词 选项来显示哦！</div>
                            <div>如果需要标记歌词行的属性（是否为背景人声或对唱人声），可以右键歌词行，选择 切换所选歌词行为背景人声/切换所选歌词行为对唱人声 或者 使用编辑菜单来切换。</div>
                            <div>如果需要批量操作歌词，可以点击歌词行左侧的选择框来选中歌词行，然后使用编辑菜单的操作批量处理歌词哦！</div>
                        </NSpace>
                    </NStep>
                    <NStep title="歌词打轴">
                        <NSpace vertical>
                            <div>点击上方的 <NButton>打轴模式</NButton> 按钮即可进入打轴模式！</div>
                            <div>在下方的音乐播放栏里加载好音乐，就可以开始播放打轴了。</div>
                            <div>如果音乐太快，也可以在音乐播放栏的右侧调节播放速度，这样手就能跟上了~</div>
                            <div>以下是桌面版本的默认打轴按键设置：</div>
                        </NSpace>
                        <table>
                            <tr>
                                <th>按键</th>
                                <th>说明</th>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 A</NButton>
                                </td>
                                <td>移动到上一个单词</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 D</NButton>
                                </td>
                                <td>移动到下一个单词</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 W</NButton>
                                </td>
                                <td>移动到上一行歌词的第一个单词</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 S</NButton>
                                </td>
                                <td>移动到下一个单词的第一个单词</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 R</NButton>
                                </td>
                                <td>移动到上一个单词，并设置播放位置为目标单词的​起始时间</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 Y</NButton>
                                </td>
                                <td>移动到下一个单词，并设置播放位置为目标单词的​起始时间</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 F</NButton>
                                </td>
                                <td>记录当前时间为当前单词的起始时间</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 G</NButton>
                                </td>
                                <td>记录当前时间为当前单词的结束时间和下一个单词的起始时间，并移动到下一个单词</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 H</NButton>
                                </td>
                                <td>记录当前时间为当前单词的结束时间，并移动到下一个单词（用于空出间奏时间）</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 [</NButton>
                                </td>
                                <td>将播放速度降低 0.1x</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 ]</NButton>
                                </td>
                                <td>将播放速度增加 0.1x</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>按键 '</NButton>
                                </td>
                                <td>设置播放速度为原速</td>
                            </tr>
                            <tr>
                                <td>
                                    <NButton block>空格</NButton>
                                </td>
                                <td>播放 / 暂停音乐</td>
                            </tr>
                        </table>
                    </NStep>
                    <NStep title="保存歌词">
                        <NSpace vertical>
                            <div>和加载歌词类似，您可以将歌词保存为 TTML 格式，也可以导出到其他主流歌词格式。</div>
                            <div>但是导出成 LRC 格式会丢失逐词歌词的单词信息和歌词行属性信息，而导出成 YRC/QRC 格式会丢失歌词行的属性信息，要留意哦！</div>
                        </NSpace>
                    </NStep>
                    <NStep title="使用歌词">
                        <NSpace vertical>
                            <div>最后就是放到 AMLL 插件的 TTML 歌词文件夹内，将歌词文件命名为网易云的歌曲 ID（可以通过 AMLL 播放页面内右键复制得到）后重新切歌即可读取！</div>
                            <div>为了让更多人能够体验到 TTML 歌词带来的效果，您也可以将您的歌词上传到 <a href="https://github.com/Steve-xmh/amll-ttml-db">SteveXMH 的 TTML 歌词仓库</a>上，供大家下载使用哦！
                            </div>
                        </NSpace>
                    </NStep>
                </NSteps>
                之后您可以通过左上角的 文件菜单 - 关于 - 简短教程 再次访问本页面，如果忘记怎么操作了可以再来看看哦！
            </NSpace>
            <template #footer>
                <NButton type="primary" @click="settings.showingTutorial = false">我知道了</NButton>
            </template>
        </NCard>
    </NModal>
</template>

<script setup lang="ts">
import { NCard, NModal, NSteps, NStep, NSpace, NButton } from 'naive-ui';
import { useSettings } from '../store';

const settings = useSettings();

</script>
